import { Schema, model, Document } from 'mongoose';

/**
 * Represents a user of the application.
 */
export interface IUser extends Document {
  /** The user's unique username. */
  username: string;
  /** The user's hashed password. */
  password: string;
  /** Flag to check if the user has completed the initial tutorial. */
  hasCompletedTutorial: boolean;
}

const userSchema = new Schema<IUser>({
  /** The username for the account, must be unique. */
  username: { type: String, required: true, unique: true },
  /** The hashed password for the account. */
  password: { type: String, required: true },
  /** Flag to check if the user has completed the initial tutorial. Defaults to false. */
  hasCompletedTutorial: { type: Boolean, default: false, required: true },
});

export const User = model('User', userSchema);
