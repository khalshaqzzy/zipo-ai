import { Schema, model, Document } from 'mongoose';

/**
 * Represents a command in the canvas state.
 * This provides a more specific type for the objects stored in canvasState.
 */
interface ICommand {
  command: string;
  payload: {
    text?: string;
    audioContent?: string; // Base64 encoded audio for 'speak' commands
    [key: string]: any;
  };
  delay?: number;
}

/**
 * Represents a Zipo Learning Module.
 * Each module is a self-contained, pre-generated lesson created by the AI.
 */
export interface IModule extends Document {
  /** The ID of the user who owns the module. */
  userId: Schema.Types.ObjectId;
  /** The title of the module, typically derived from the user's initial prompt. */
  title: string;
  /** The initial prompt provided by the user to generate the module. */
  prompt: string;
  /** The selected length of the module, determining the number of LLM responses. */
  moduleLength: 'Short' | 'Medium' | 'Long';
  /** The language selected for this specific module's speech synthesis. */
  language: string;
  /** 
   * The final state of the visual canvas, stored as an array of command objects.
   * For 'speak' commands, the payload now includes the pre-generated, base64-encoded audioContent.
   */
  canvasState?: ICommand[];
  /** An array of all the "speak" command texts, forming the module's transcript. */
  transcript?: string[];
  /** The generation status of the module. */
  status: 'generating' | 'completed' | 'failed';
  /** The timestamp when the module was created. */
  createdAt: Date;
  /** The timestamp when the module was last updated. */
  updatedAt: Date;
}

const moduleSchema = new Schema({
  /** Reference to the User who owns this module. */
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  /** The title of the learning module. */
  title: { type: String, required: true },
  /** The user's initial prompt. */
  prompt: { type: String, required: true },
  /** The specified length of the module. */
  moduleLength: { type: String, enum: ['Short', 'Medium', 'Long'], required: true },
  /** The language for the module's speech synthesis. */
  language: { type: String, required: true },
  /** 
   * Stores the array of canvas command objects. Using Mixed type for flexibility, 
   * as the payload structure varies between commands. The ICommand interface provides TS-level safety.
   */
  canvasState: { type: Schema.Types.Mixed, default: [] },
  /** Stores the ordered text from all 'speak' commands. */
  transcript: { type: [String], default: [] },
  /** The current status of the module generation process. */
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
}, {
  timestamps: true
});

export const Module = model<IModule>('Module', moduleSchema);