import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose, { isValidObjectId } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import routers
import authRouter from './routes/auth';
import sessionsRouter from './routes/sessions';
import uploadRouter from './routes/upload';
// import quizRouter from './routes/quiz';
import userRouter from './routes/user';
import moduleRouter from './routes/module';

// Import models
import { Session } from './models/Session';
import { Message, IMessage } from './models/Message';
import { File } from './models/File';

// Import services and utilities
import { createInitialPrompt, buildHistoryForChat, generativeModel, generativeModelTools } from './llm';
import { Content } from '@google/generative-ai';
import { extractTextFromFile } from './fileprocessing';
import { synthesizeSpeech } from './services/ttsService';
import { createSpeechStream } from './services/sttService';
import { processUserUtterance } from './services/voiceAgentService';
import { retrieveRelevantChunks } from './services/ragService';
import { generateModule } from './services/moduleService';
import { summarizeConversation } from './services/memoryService';


dotenv.config();

// --- TypeScript Interfaces and Type Augmentation ---

/**
 * Defines the structure for a single command sent to the frontend canvas.
 */
interface Command {
    command: string;
    payload: any;
    delay?: number;
}

// Augment the Socket.IO Socket interface to include our custom `userId` property.
declare module 'socket.io' {
    interface Socket {
        userId: string;
    }
}

// --- Express App and HTTP Server Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const server = http.createServer(app);

// --- Socket.IO Server Setup ---
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Allow connections from the frontend URL
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/zipo';

// --- Database Connection ---
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Route Definitions ---
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/upload', uploadRouter);
// app.use('/api/quiz', quizRouter);
app.use('/api/user', userRouter);
app.use('/api/modules', moduleRouter);

// --- Socket.IO Authentication Middleware ---
// This middleware protects all Socket.IO connections.
io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token not provided.'));
    
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error('Server configuration error: JWT_SECRET not set.'));

    try {
        const decoded = jwt.verify(token, secret) as { userId: string };
        (socket as any).userId = decoded.userId; // Attach userId to the socket object
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token.'));
    }
});

// --- Core AI Command Orchestration ---

/**
 * Processes an array of commands from the LLM, synthesizes speech for 'speak' commands,
 * and then emits the fully processed command stream to the client.
 * @param {Command[]} rawCommands - The array of commands received from the LLM.
 * @param {Socket} socket - The client's socket instance.
 * @param {string} sessionId - The ID of the current session.
 * @param {string} languageCode - The language code for TTS.
 */
const orchestrateAndEmitCommands = async (rawCommands: Command[], socket: Socket, sessionId: string, languageCode: string) => {
    console.log(`[Orchestrator] INFO: Starting orchestration for ${rawCommands.length} commands for session ${sessionId}.`);
    try {
        // Process commands, synthesizing audio for any 'speak' commands.
        const processedCommands = await Promise.all(
            rawCommands.map(async (cmd, index) => {
                if (cmd.command === 'speak' && cmd.payload.text) {
                    console.log(`[Orchestrator] INFO: Found 'speak' command at index ${index}. Text: "${cmd.payload.text}"`);
                    try {
                        const audioContent = await synthesizeSpeech(cmd.payload.text, languageCode);
                        console.log(`[Orchestrator] SUCCESS: TTS synthesis successful for command index ${index}.`);
                        return { ...cmd, payload: { ...cmd.payload, audioContent } };
                    } catch (ttsError) {
                        console.error(`[Orchestrator] ERROR: TTS synthesis failed for command index ${index}. Sending command without audio.`, ttsError);
                        return cmd; // Fallback: send the command without audio content.
                    }
                }
                return cmd;
            })
        );

        // Save the AI's full response (with commands) to the database.
        console.log('[Orchestrator] INFO: All commands processed. Saving AI message to database.');
        const aiMessage = new Message({ sessionId: sessionId, sender: 'ai', text: JSON.stringify(processedCommands) });
        await aiMessage.save();

        // Emit the final, processed command stream to the client.
        console.log(`[Orchestrator] INFO: Emitting 'command_stream_received' to client for session ${sessionId}.`);
        socket.emit('command_stream_received', { sessionId, commands: processedCommands });

    } catch (error) {
        console.error('[Orchestrator] FATAL: Unhandled error during command orchestration:', error);
        socket.emit('session_error', { message: 'Failed to process and orchestrate AI commands.' });
    }
};


// --- Main Session Socket.IO Namespace (`/`) ---
const sessionNsp = io.of('/');

sessionNsp.on('connection', (socket: Socket) => {
    console.log(`A user connected to session namespace: ${socket.id}, userId: ${socket.userId}`);

    // Listener for starting or continuing a learning session.
    socket.on('start_session', async (data: { promptText: string, sessionId?: string, fileIds?: string[], languageCode?: string }) => {
        const { promptText, sessionId, fileIds, languageCode = 'id-ID' } = data;
        const userId = socket.userId;
        let currentSessionId = sessionId;
        const isNewSession = !sessionId || !isValidObjectId(sessionId);
        console.log(`[Socket] INFO: Received 'start_session' event. isNew: ${isNewSession}, sessionId: ${sessionId}`);

        try {
            let currentSession: any;
            let conversationHistory: Content[] = [];
            let documentSummaries: string | undefined = undefined;

            if (fileIds && fileIds.length > 0) {
                const files = await File.find({ '_id': { $in: fileIds }, 'userId': userId });
                if (files.length > 0) {
                    documentSummaries = files
                        .map(file => `File: '${file.originalFilename}', Summary: '${file.summary || 'Not available'}'`)
                        .join('\n');
                }
            }

            if (isNewSession) {
                const titlePrompt = `Summarize the following user prompt into a short, descriptive title of no more than 5 words: "${promptText}"`;
                const titleResult = await generativeModel.generateContent(titlePrompt);
                const generatedTitle = (await titleResult.response).text().trim().replace(/['"]+/g, '');

                currentSession = new Session({ title: generatedTitle || promptText.substring(0, 30), userId });
                await currentSession.save();
                currentSessionId = currentSession._id.toString();
                socket.emit('session_created', { sessionId: currentSessionId, title: currentSession.title, updatedAt: currentSession.updatedAt });
            } else {
                currentSession = await Session.findOne({ _id: sessionId, userId: userId });
                if (currentSession) {
                    const previousMessages = await Message.find({ sessionId: currentSession._id }).sort({ createdAt: 1 });
                    conversationHistory = buildHistoryForChat(previousMessages);
                }
            }

            if (!currentSession) throw new Error("Session could not be found or created.");

            const userMessage = new Message({ sessionId: currentSession._id, sender: 'user', text: promptText, fileIds: fileIds ? fileIds.filter(id => isValidObjectId(id)) : [] });
            await userMessage.save();

            const messageCount = await Message.countDocuments({ sessionId: currentSession._id });
            if (messageCount > 0 && messageCount % 10 === 0) {
                Message.find({ sessionId: currentSession._id }).sort({ createdAt: 1 }).then(messages => {
                    summarizeConversation(messages).then(summary => {
                        if (summary) {
                            currentSession.summary = summary;
                            currentSession.save();
                        }
                    });
                });
            }

            console.log('[Socket] INFO: Starting stateful, multi-turn chat workflow...');
            const initialPrompt = createInitialPrompt(documentSummaries);
            const chat = generativeModelTools.startChat({ history: [...initialPrompt, ...conversationHistory] });
            let result = await chat.sendMessage(promptText);

            let calls;
            while ((calls = result.response.functionCalls()) && calls.length > 0) {
                console.log(`[Socket] INFO: LLM requested ${calls.length} tool(s).`);
                const toolResponses: any[] = [];

                for (const call of calls) {
                    if (call.name === 'retrieve_document_context') {
                        const ragQuery = (call.args as Record<string, any>)['query'] as string;
                        const validFileIds = fileIds ? fileIds.filter(id => isValidObjectId(id)) : [];
                        let ragContent = '';
                        if (validFileIds.length > 0) {
                            ragContent = await retrieveRelevantChunks(ragQuery, validFileIds);
                        }
                        toolResponses.push({
                            functionResponse: {
                                name: 'retrieve_document_context',
                                response: { result: ragContent || 'No relevant content found.' },
                            }
                        });
                    }
                }

                console.log('[Socket] INFO: Sending tool responses back to LLM.');
                result = await chat.sendMessage(JSON.stringify(toolResponses));
            }

            const finalResponse = result.response;
            const finalCalls = finalResponse.functionCalls();
            if (!finalCalls) {
                throw new Error("LLM response did not contain function calls after synthesis.");
            }

            const commandStream: Command[] = finalCalls.map(call => ({
                command: call.name,
                payload: call.args
            }));
            
            currentSession.updatedAt = new Date();
            await currentSession.save();

            console.log('[Socket] INFO: Handing off to orchestrator...');
            await orchestrateAndEmitCommands(commandStream, socket, currentSession._id.toString(), languageCode);

        } catch (error) {
            console.error('[Socket] FATAL: Unhandled error in start_session handler:', error);
            socket.emit('session_error', { message: 'Failed to process session. ' + (error instanceof Error ? error.message : 'Unknown error.') });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected from session namespace: ${socket.id}`);
    });

    socket.on('generate_module', async (data: { prompt: string, fileIds?: string[], moduleLength: 'Short' | 'Medium' | 'Long', moduleLanguage: string }) => {
        const { prompt, fileIds, moduleLength, moduleLanguage } = data;
        const userId = socket.userId;
        console.log(`[Socket] INFO: Received 'generate_module' event from user ${userId}. Length: ${moduleLength}, Language: ${moduleLanguage}, Files: ${fileIds?.length || 0}`);

        try {
            await generateModule({ prompt, fileIds: fileIds || [], moduleLength, moduleLanguage, userId, socket });
            console.log(`[Socket] INFO: generateModule service call completed for user ${userId}.`);
        } catch (error) {
            console.error(`[Socket] ERROR: The module generation process failed for user ${userId}.`, error);
        }
    });
});

// --- Live Conversation Socket.IO Namespace (`/live-conversation`) ---
const liveConversationNsp = io.of('/live-conversation');

liveConversationNsp.on('connection', (socket: Socket) => {
    console.log(`[Live] INFO: User connected to live-conversation: ${socket.id}, userId: ${socket.userId}`);
    
    let speechStream: any = null;
    let liveHistory: IMessage[] = [];

    // Listener for when a user starts a live conversation.
    socket.on('start_conversation', (data: { sessionId: string, languageCode?: string }) => {
        console.log(`[Live] INFO: 'start_conversation' received for session ${data.sessionId} with language ${data.languageCode}`);
        liveHistory = []; // Reset history for the new conversation.
        const currentLanguageCode = data.languageCode || 'id-ID';
        
        // Create a persistent speech-to-text stream for the duration of the conversation.
        speechStream = createSpeechStream(
            async (sttData) => {
                const result = sttData.results[0];
                if (!result || !result.alternatives[0]) return;

                const transcript = result.alternatives[0].transcript;
                const isFinal = result.isFinal;

                socket.emit('transcript_update', { transcript, isFinal });

                if (isFinal && transcript.trim()) {
                    console.log(`[Live] SUCCESS: Final transcript received: "${transcript}"`);
                    socket.emit('stop_ai_playback'); // Interrupt any ongoing AI speech.
                    
                    liveHistory.push({ sender: 'user', text: transcript } as IMessage);
                    
                    // Fetch full session context for the voice agent.
                    console.log('[Live] INFO: Fetching session context to generate AI response.');
                    const sessionMessages = await Message.find({ sessionId: data.sessionId }).sort({ createdAt: 1 });
                    const fileIds = sessionMessages.flatMap(m => m.fileIds || []);
                    const validFileIds = fileIds.map(id => id.toString()).filter(id => isValidObjectId(id));
                    const aggregatedFileContent = await retrieveRelevantChunks(transcript, validFileIds);
                    console.log(`[Live] INFO: Retrieved relevant chunks from ${validFileIds.length} files for context.`);

                    // Get the agent's decision.
                    console.log('[Live] INFO: Calling Voice Agent to process utterance.');
                    const { verbalResponse, triggerVisualization, promptForLLM } = await processUserUtterance(transcript, liveHistory, sessionMessages, aggregatedFileContent);

                    if (!verbalResponse) return;

                    // Synthesize and send the audio response.
                    console.log(`[Live] INFO: Synthesizing speech for verbal response: "${verbalResponse}"`);
                    const audioContent = await synthesizeSpeech(verbalResponse, currentLanguageCode);
                    socket.emit('ai_audio_response', { audioContent, transcript: verbalResponse });
                    liveHistory.push({ sender: 'ai', text: verbalResponse } as IMessage);

                    // If the agent decided to trigger a visualization, notify the client.
                    if (triggerVisualization && promptForLLM) {
                        console.log('[Live] INFO: Visualization triggered. Emitting trigger_visualization to client.');
                        socket.emit('trigger_visualization', { prompt: promptForLLM });
                    }
                }
            },
            (error) => {
                console.error('[Live] FATAL: STT Stream Error:', error);
                socket.emit('conversation_error', { message: 'Speech recognition error.' });
            },
            () => { speechStream = null; }, // On stream end
            currentLanguageCode
        );
    });

    // Listener for audio chunks from the client.
    socket.on('audio_stream_from_client', (audioChunk) => {
        if (speechStream && !speechStream.destroyed) {
            speechStream.write(audioChunk);
        }
    });

    // Listener for when the client interrupts (e.g., stops listening).
    socket.on('client_interruption', () => {
        console.log(`[Live] INFO: 'client_interruption' received. Destroying STT stream.`);
        if (speechStream) {
            speechStream.destroy();
            speechStream = null;
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`[Live] INFO: User disconnected from live-conversation: ${socket.id}. Reason: ${reason}`);
        if (speechStream) {
            speechStream.destroy();
            speechStream = null;
        }
    });
});

// --- Start Server ---
server.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});

export { io };