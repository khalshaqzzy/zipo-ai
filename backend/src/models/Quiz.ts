/*
import mongoose, { Document, Schema } from 'mongoose';
import { IQuestion, QuestionSchema } from './Question';


export interface IQuiz extends Document {

  userId: mongoose.Schema.Types.ObjectId;

  title: string;

  status: 'active' | 'completed';

  questions: IQuestion[];

  answers: Map<string, number | number[] | string>;

  score?: number;

  timeLimit: number; 

  timeLeft: number; 

  createdAt: Date;

  completedAt?: Date;
}

const QuizSchema: Schema = new Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },

  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },

  questions: [QuestionSchema],

  answers: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },

  score: { type: Number },

  timeLimit: { type: Number, required: true },

  timeLeft: { type: Number, required: true }, 

  completedAt: { type: Date },
}, { timestamps: true });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
*/