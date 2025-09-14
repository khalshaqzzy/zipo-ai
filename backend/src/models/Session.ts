import { Schema, model, Document } from 'mongoose';

/**
 * Represents a single learning session.
 * Each session belongs to a user and contains the conversation history and canvas state.
 */
export interface ISession extends Document {
  /** The ID of the user who owns the session. */
  userId: Schema.Types.ObjectId;
  /** The title of the session, typically derived from the first user prompt. */
  title: string;
  /** A running summary of the conversation for long-term context. */
  summary?: string;
  /** The state of the visual canvas, stored as a flexible object array. */
  canvasState?: any;
}

const sessionSchema = new Schema({
  /** Reference to the User who owns this session. */
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  /** The title of the learning session. */
  title: { type: String, required: true },
  /** A running summary of the conversation. */
  summary: { type: String },
  /** Stores the array of canvas objects to be rendered on the frontend. */
  canvasState: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

export const Session = model('Session', sessionSchema);