/*
import express from 'express';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { generateQuizFromFiles } from '../services/quizService';
import { Quiz } from '../models/Quiz';
import { IQuestion } from '../models/Question';
import mongoose from 'mongoose';

const router = express.Router();

// All routes in this file are protected and require authentication.
router.use(authMiddleware);


router.post('/generate', async (req: IAuthRequest, res) => {
  try {
    const { fileIds, instructions, questionCount } = req.body;
    const userId = req.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(401).json({ message: 'Unauthorized or invalid user ID.' });
    }
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'File IDs are required.' });
    }
    if (!instructions || typeof instructions !== 'string') {
      return res.status(400).json({ message: 'Instructions are required.' });
    }
    if (!questionCount || questionCount < 5 || questionCount > 15) {
      return res.status(400).json({ message: 'Question count must be between 5 and 15.' });
    }

    const quiz = await generateQuizFromFiles(fileIds, instructions, questionCount, userId);
    
    res.status(201).json({
      message: 'Quiz generated successfully!',
      quiz: quiz,
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      message: 'Failed to generate quiz.',
      error: error instanceof Error ? error.message : 'An unknown error occurred.'
    });
  }
});


router.get('/recent', async (req: IAuthRequest, res) => {
    try {
        const userId = req.userId;
        const quizzes = await Quiz.find({ userId }).sort({ updatedAt: -1 }).limit(20);

        const active = quizzes.filter(q => q.status === 'active');
        const completed = quizzes.filter(q => q.status === 'completed');

        res.json({ active, completed });
    } catch (error) {
        console.error('Error fetching recent quizzes:', error);
        res.status(500).json({ message: 'Failed to fetch recent quizzes.' });
    }
});


router.get('/:quizId', async (req: IAuthRequest, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({ message: 'Invalid Quiz ID.' });
        }

        const quiz = await Quiz.findOne({ _id: quizId, userId });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found or you do not have permission to access it.' });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Failed to fetch quiz data.' });
    }
});


router.post('/:quizId/save-progress', async (req: IAuthRequest, res) => {
    try {
        const { quizId } = req.params;
        const { answers, timeLeft } = req.body;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({ message: 'Invalid Quiz ID.' });
        }

        const quiz = await Quiz.findOne({ _id: quizId, userId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        if (quiz.status === 'completed') {
            return res.status(400).json({ message: 'Cannot save progress for a completed quiz.' });
        }

        quiz.answers = answers;
        quiz.timeLeft = timeLeft;
        await quiz.save();

        res.json({ message: 'Progress saved successfully.' });

    } catch (error) {
        console.error('Error saving quiz progress:', error);
        res.status(500).json({ message: 'Failed to save quiz progress.' });
    }
});


router.post('/:quizId/submit', async (req: IAuthRequest, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({ message: 'Invalid Quiz ID.' });
        }

        const quiz = await Quiz.findOne({ _id: quizId, userId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        if (quiz.status === 'completed') {
            return res.status(400).json({ message: 'This quiz has already been completed.' });
        }

        let score = 0;
        quiz.questions.forEach((question: IQuestion) => {
            const questionId = (question as any)._id.toString();
            const userAnswer = answers[questionId];
            const correctAnswer = question.correctAnswer;

            if (question.type === 'checkboxes') {
                // For checkboxes, compare sorted arrays
                const sortedUserAnswer = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
                const sortedCorrectAnswer = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [];
                if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer)) {
                    score++;
                }
            } else {
                // For multiple-choice and true-false
                if (userAnswer === correctAnswer) {
                    score++;
                }
            }
        });

        quiz.answers = answers;
        quiz.score = score;
        quiz.status = 'completed';
        quiz.completedAt = new Date();
        quiz.timeLeft = 0;

        await quiz.save();

        res.json({
            message: 'Quiz submitted successfully!',
            score: quiz.score,
            totalQuestions: quiz.questions.length,
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Failed to submit quiz.' });
    }
});

export default router;
*/