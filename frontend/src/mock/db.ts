/**
 * @file This file contains mock data for the application.
 * It simulates a simple in-memory database for development and testing purposes,
 * providing sample chat sessions and messages.
 * NOTE: This data is not used when connected to the actual backend.
 */

/**
 * Represents a single message in a chat session.
 */
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

/**
 * Defines the structure of the mock database, which is an object
 * where keys are session IDs and values are arrays of messages.
 */
interface MockDB {
  [sessionId: string]: Message[];
}

/**
 * The mock database instance.
 * Contains several predefined chat sessions with messages.
 */
export const mockDb: MockDB = {
  "session1": [
    { id: "msg1-1", type: 'user', content: "Can you explain the water cycle?", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 10000) },
    { id: "msg1-2", type: 'ai', content: "Of course! The water cycle is the path that all water follows as it moves around Earth in different states. I can show you a visual breakdown. Click the play button to start the interactive lesson!", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 8000) }
  ],
  "session2": [
    { id: "msg2-1", type: 'user', content: "What is photosynthesis?", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: "msg2-2", type: 'ai', content: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2000) },
    { id: "msg2-3", type: 'user', content: "What are the inputs and outputs?", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4000) },
    { id: "msg2-4", type: 'ai', content: "The main inputs are sunlight, water, and carbon dioxide. The outputs are oxygen and glucose (sugar).", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 6000) }
  ],
  "session3": [
    { id: "msg3-1", type: 'user', content: "I uploaded a PDF about black holes. Can you give me the basics?", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: "msg3-2", type: 'ai', content: "Certainly. Based on the document, a black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it.", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2000) }
  ],
};
