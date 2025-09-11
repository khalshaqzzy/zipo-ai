import { Module } from '../models/Module';
import { File } from '../models/File';
import { generativeModel, createModulePrompt, createModulePlanPrompt } from '../llm';
import { extractTextFromFile } from '../fileprocessing';
import { synthesizeSpeech } from './ttsService';
import { isValidObjectId } from 'mongoose';

interface GenerationParams {
  prompt: string;
  fileIds: string[];
  moduleLength: 'Short' | 'Medium' | 'Long';
  moduleLanguage: string;
  userId: string;
  socket: any; // Use a more specific type if available
}


const getStepCount = (length: 'Short' | 'Medium' | 'Long'): number => {
    switch (length) {
        case 'Short': return 1;
        case 'Medium': return 3;
        case 'Long': return 5;
    }
};

/**
 * Extracts the first valid JSON object or array from a string.
 * It handles cases where the JSON is embedded within markdown code blocks.
 * @param text The raw string potentially containing JSON.
 * @returns A string containing only the JSON part.
 * @throws An error if no valid JSON structure is found.
 */
function extractJson(text: string): string {
    // First, try to find JSON within markdown fences (```json ... ```)
    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const targetText = fencedMatch ? fencedMatch[1] : text;

    // Find the first occurrence of '{' or '['
    const firstBrace = targetText.indexOf('{');
    const firstBracket = targetText.indexOf('[');

    let start = -1;
    if (firstBrace === -1) start = firstBracket;
    else if (firstBracket === -1) start = firstBrace;
    else start = Math.min(firstBrace, firstBracket);

    if (start === -1) {
        throw new Error("No JSON object or array found in the response.");
    }

    // Find the last occurrence of '}' or ']'
    const lastBrace = targetText.lastIndexOf('}');
    const lastBracket = targetText.lastIndexOf(']');
    
    let end = Math.max(lastBrace, lastBracket);

    if (end === -1) {
        throw new Error("JSON structure is incomplete (missing closing brace or bracket).");
    }

    return targetText.substring(start, end + 1);
}


export const generateModule = async ({ prompt, fileIds, moduleLength, moduleLanguage, userId, socket }: GenerationParams) => {
  console.log(`[ModuleService] INFO: Starting module generation for user ${userId}.`);

  const title = (await generativeModel.generateContent(`Summarize the following user prompt into a short, descriptive title of no more than 5 words: "${prompt}"`)).response.text().trim().replace(/['"]+/g, '');
  console.log(`[ModuleService] INFO: Generated title: "${title}"`);

  const newModule = new Module({
    userId,
    title: title || prompt.substring(0, 40) + '...', 
    prompt,
    moduleLength,
    language: moduleLanguage,
    status: 'generating',
  });
  await newModule.save();
  console.log(`[ModuleService] INFO: Created new module document with ID: ${newModule._id}`);

  try {
    let aggregatedFileContent = '';
    if (fileIds && fileIds.length > 0) {
        console.log(`[ModuleService] INFO: Aggregating content from ${fileIds.length} file(s).`);
        const validFileIds = fileIds.filter(id => isValidObjectId(id));
        const files = await File.find({ _id: { $in: validFileIds }, userId: userId });
        const contentPromises = files.map(file =>
            extractTextFromFile(file.path, file.mimetype).then(content => `--- START FILE: ${file.originalFilename} ---
${content}
--- END FILE: ${file.originalFilename} ---`)
        );
        aggregatedFileContent = (await Promise.all(contentPromises)).join('  ');
        console.log(`[ModuleService] SUCCESS: File content aggregated.`);
    }

    // Planning Step
    console.log(`[ModuleService] INFO: Starting planning step for module ${newModule._id}.`);
    socket.emit('module_status', { status: 'generating', message: 'Planning the module structure...', moduleId: newModule._id });
    const planPrompt = createModulePlanPrompt(prompt, moduleLength, aggregatedFileContent);
    console.log("--- MODULE PLAN PROMPT ---", planPrompt);
    const planResult = await generativeModel.generateContent(planPrompt);
    const planRawText = planResult.response.text();
    console.log("--- MODULE PLAN RAW RESPONSE ---", planRawText);
    
    const planJsonString = extractJson(planRawText);
    const modulePlan = JSON.parse(planJsonString).plan;
    if (!Array.isArray(modulePlan)) throw new Error('Module plan is not a valid array.');
    console.log(`[ModuleService] SUCCESS: Received module plan with ${modulePlan.length} steps.`);


    const totalSteps = getStepCount(moduleLength);
    let accumulatedCanvasState: any[] = [];
    let accumulatedTranscript: string[] = [];

    for (let i = 0; i < totalSteps; i++) {
        console.log(`[ModuleService] INFO: Starting generation for step ${i + 1}/${totalSteps} for module ${newModule._id}.`);
        socket.emit('module_status', { status: 'generating', message: `Generating step ${i + 1} of ${totalSteps}: ${modulePlan[i]}...`, moduleId: newModule._id });

        const context = i === 0 ? undefined : { canvasState: accumulatedCanvasState, transcript: accumulatedTranscript };
        const modulePrompt = createModulePrompt(prompt, aggregatedFileContent, context, modulePlan, modulePlan[i]);
        console.log("--- MODULE STEP PROMPT ---", modulePrompt);
        
        const result = await generativeModel.generateContent(modulePrompt);
        const rawText = result.response.text();
        console.log("\n\n=============================================================");
        console.log(`[ModuleService] RAW RESPONSE FOR STEP ${i + 1}:`);
        console.log("=============================================================");
        console.log(rawText);
        console.log("=============================================================");
        console.log(`[ModuleService] END OF RAW RESPONSE FOR STEP ${i + 1}`);
        console.log("=============================================================\n\n");

        const commandsJsonString = extractJson(rawText);

        console.log("\n--- JSON STRING TO BE PARSED ---", commandsJsonString, "\n--- END OF JSON STRING ---");

        const commands = JSON.parse(commandsJsonString);

        console.log("\n--- PARSED COMMANDS OBJECT ---", commands, "\n--- END OF PARSED COMMANDS ---");

        if (!Array.isArray(commands)) throw new Error(`LLM response for step ${i+1} was not a JSON array.`);
        console.log(`[ModuleService] INFO: Step ${i + 1} generated ${commands.length} commands.`);

        // Process commands to add TTS audio
        const processedCommands = await Promise.all(
          commands.map(async (cmd: any) => {
            if (cmd.command === 'speak' && cmd.payload.text) {
              try {
                console.log(`[ModuleService] INFO: Synthesizing speech for step ${i + 1}...`);
                const audioContent = await synthesizeSpeech(cmd.payload.text, moduleLanguage);
                console.log(`[ModuleService] SUCCESS: Speech synthesized for step ${i + 1}.`);
                return { ...cmd, payload: { ...cmd.payload, audioContent } };
              } catch (ttsError) {
                console.error(`[ModuleService] ERROR: TTS synthesis failed for step ${i + 1}. Command text: "${cmd.payload.text}"`, ttsError);
                // Return command without audio if TTS fails, so the module can still be created
                return cmd;
              }
            }
            return cmd;
          })
        );

        accumulatedCanvasState.push(...processedCommands);
        const spokenTexts = processedCommands.filter(cmd => cmd.command === 'speak').map(cmd => cmd.payload.text);
        accumulatedTranscript.push(...spokenTexts);

        // Progress is now only saved at the end.
        console.log(`[ModuleService] INFO: Step ${i + 1} completed, accumulating state.`);
    }

    // Save all accumulated data and set status to completed in a single operation.
    newModule.canvasState = accumulatedCanvasState;
    newModule.transcript = accumulatedTranscript;
    newModule.status = 'completed';
    await newModule.save();

    console.log(`[ModuleService] SUCCESS: Module ${newModule._id} completed.`);
    socket.emit('module_status', { status: 'completed', message: 'Module generation complete!', moduleId: newModule._id });
    return newModule;

  } catch (error) {
    console.error(`[ModuleService] FATAL: Error generating module ${newModule._id}:`, error);
    newModule.status = 'failed';
    await newModule.save();
    socket.emit('module_status', { status: 'failed', message: 'Failed to generate module. ' + (error instanceof Error ? error.message : 'Unknown error.'), moduleId: newModule._id });
    throw error;
  }
};
