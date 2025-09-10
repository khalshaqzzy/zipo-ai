/*
import { Schema, Document } from 'mongoose';


export interface IQuestion extends Document {

  question: string;

  type: 'multiple-choice' | 'true-false' | 'checkboxes';

  options: string[];

  correctAnswer: number | number[];

  explanation?: string;
}

export const QuestionSchema = new Schema<IQuestion>({

  question: { type: String, required: true },

  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'checkboxes'], 
    required: true 
  },

  options: [{ type: String }],

  correctAnswer: { type: Schema.Types.Mixed, required: true },

  explanation: { type: String },
});
*/