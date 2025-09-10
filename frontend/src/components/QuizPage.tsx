/*
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, Trophy, Loader2, Save, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

// Interfaces to match backend models
interface IQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'checkboxes';
  options: string[];
  correctAnswer: number | number[] | string;
  explanation?: string;
}

interface IQuiz {
  _id: string;
  title: string;
  questions: IQuestion[];
  status: 'active' | 'completed';
  answers: { [key: string]: number | number[] | string };
  timeLeft: number;
  score?: number;
}

const QuestionReview: React.FC<{ question: IQuestion; questionNumber: number; userAnswer: any }> = ({ question, questionNumber, userAnswer }) => {
    const isCorrect = () => {
        if (userAnswer === undefined) return false;
        if (question.type === 'checkboxes') {
            if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
            const sortedUserAnswer = [...userAnswer].sort();
            const sortedCorrectAnswer = [...question.correctAnswer].sort();
            return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
        }
        return userAnswer === question.correctAnswer;
    };

    const correct = isCorrect();

    return (
        <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${correct ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${correct ? 'bg-green-500' : 'bg-red-500'}`}>
                    {questionNumber}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{question.question}</h3>
            </div>
            <div className="space-y-3 ml-12">
                {question.options.map((option, index) => {
                    const isUserAnswer = question.type === 'checkboxes' 
                        ? (userAnswer as number[])?.includes(index)
                        : userAnswer === index;
                    
                    const isCorrectAnswer = question.type === 'checkboxes'
                        ? (question.correctAnswer as number[])?.includes(index)
                        : question.correctAnswer === index;

                    let stateClasses = 'border-slate-200 bg-slate-50';
                    if (isCorrectAnswer) {
                        stateClasses = 'border-green-500 bg-green-50 text-green-800 font-semibold';
                    }
                    if (isUserAnswer && !isCorrectAnswer) {
                        stateClasses = 'border-red-500 bg-red-50 text-red-800 font-semibold';
                    }

                    return (
                        <div key={index} className={`flex items-center p-3 rounded-lg border-2 ${stateClasses}`}>
                            {isUserAnswer && !isCorrectAnswer && <XCircle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />}
                            {isCorrectAnswer && <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />}
                            {!isUserAnswer && !isCorrectAnswer && <div className="w-5 h-5 mr-3 flex-shrink-0" />}
                            <span>{option}</span>
                        </div>
                    );
                })}
            </div>
            {question.explanation && (
                <div className="mt-4 ml-12 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="text-sm font-semibold text-blue-800">Explanation:</p>
                    <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                </div>
            )}
        </div>
    );
}

const QuizPage: React.FC = () => {
  const [quizData, setQuizData] = useState<IQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number | number[] | string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        addToast('Quiz ID is missing.', 'error');
        navigate('/app');
        return;
      }
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/quiz/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz data.');
        }
        const data: IQuiz = await response.json();
        setQuizData(data);
        setAnswers(data.answers || {});
        setTimeLeft(data.timeLeft);
        if (data.status === 'completed') {
          setIsCompleted(true);
          setShowResults(true);
        }
      } catch (error) {
        console.error(error);
        addToast((error as Error).message, 'error');
        navigate('/app');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, addToast]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted && quizData) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isCompleted, quizData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: number | string) => {
    const currentQuestion = quizData?.questions.find(q => q._id === questionId);
    if (!currentQuestion) return;

    if (currentQuestion.type === 'checkboxes') {
        const currentAnswers = (answers[questionId] as number[] | undefined) || [];
        const newAnswers = currentAnswers.includes(answer as number)
            ? currentAnswers.filter(a => a !== answer)
            : [...currentAnswers, answer as number];
        setAnswers(prev => ({ ...prev, [questionId]: newAnswers.sort() }));
    } else {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaveProgress = useCallback(async () => {
    if (!quizId || isSaving) return;
    
    setIsSaving(true);
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/quiz/${quizId}/save-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ answers, timeLeft }),
        });
        addToast('Progress saved!', 'success');
        navigate('/app');
    } catch (error) {
        addToast('Failed to save progress.', 'error');
    } finally {
        setIsSaving(false);
    }
  }, [quizId, answers, timeLeft, navigate, addToast, isSaving]);

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setIsCompleted(true);
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/quiz/${quizId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ answers }),
        });
        if (!response.ok) throw new Error('Failed to submit quiz.');
        
        const result = await response.json();
        setQuizData(prev => prev ? { ...prev, score: result.score, status: 'completed' } : null);
        setShowResults(true);
        addToast('Quiz submitted successfully!', 'success');

    } catch (error) {
        addToast((error as Error).message, 'error');
        setIsCompleted(false); // Allow retry
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl text-slate-600">Quiz not found.</p>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const scorePercentage = quizData.score !== undefined ? (quizData.score / quizData.questions.length) * 100 : 0;

  if (isReviewMode) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Review Quiz</h1>
                        <p className="text-slate-600">"{quizData.title}"</p>
                    </div>
                    <button
                        onClick={() => setIsReviewMode(false)}
                        className="px-6 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Results
                    </button>
                </div>
                <div className="space-y-6">
                    {quizData.questions.map((q, index) => (
                        <QuestionReview key={q._id} question={q} questionNumber={index + 1} userAnswer={answers[q._id]} />
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${getScoreGradient(scorePercentage)} flex items-center justify-center shadow-2xl`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Quiz Completed!</h1>
            <p className="text-xl text-slate-600">Here are your results for "{quizData.title}"</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(scorePercentage)}`}>
                {quizData.score}/{quizData.questions.length}
              </div>
              <div className={`text-2xl font-semibold mb-6 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage.toFixed(0)}% Score
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 mb-6">
                <div 
                  className={`h-4 rounded-full bg-gradient-to-r ${getScoreGradient(scorePercentage)} transition-all duration-1000`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{quizData.score}</div>
                  <div className="text-sm text-slate-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{quizData.questions.length - (quizData.score || 0)}</div>
                  <div className="text-sm text-slate-500">Incorrect</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{quizData.questions.length}</div>
                  <div className="text-sm text-slate-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="px-8 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Back to Dashboard
            </button>
             <button
              onClick={() => setIsReviewMode(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Eye size={20} />
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 text-slate-600"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ArrowLeft size={24} />}
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save & Exit'}</span>
              </button>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-800 truncate max-w-xs" title={quizData.title}>{quizData.title}</h1>
                <p className="text-slate-600 text-sm">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentQuestionIndex + 1}
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {currentQuestion.type.replace('-', ' ')}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>
          <div className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options.map((option, index) => (
                <label
                    key={index}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={answers[currentQuestion._id] === index}
                    onChange={() => handleAnswerChange(currentQuestion._id, index)}
                    className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    }`}>
                    {answers[currentQuestion._id] === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                    </div>
                    <span className="text-slate-700 font-medium">{option}</span>
                </label>
            ))}

            {currentQuestion.type === 'true-false' && currentQuestion.options.map((option, index) => (
                <label
                    key={index}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={answers[currentQuestion._id] === index}
                    onChange={() => handleAnswerChange(currentQuestion._id, index)}
                    className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    }`}>
                    {answers[currentQuestion._id] === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                    </div>
                    <span className="text-slate-700 font-medium">{option}</span>
                </label>
            ))}

            {currentQuestion.type === 'checkboxes' && currentQuestion.options.map((option, index) => {
                const isChecked = (answers[currentQuestion._id] as number[] | undefined)?.includes(index) || false;
                return (
                    <label
                        key={index}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isChecked
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <input
                        type="checkbox"
                        name={`question-${currentQuestion._id}`}
                        value={index}
                        checked={isChecked}
                        onChange={() => handleAnswerChange(currentQuestion._id, index)}
                        className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                        isChecked
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                        }`}>
                        {isChecked && (
                            <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        </div>
                        <span className="text-slate-700 font-medium">{option}</span>
                    </label>
                );
            })}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {quizData.questions.map((q, index) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : answers[q._id] !== undefined
                    ? 'bg-green-100 text-green-600 border-2 border-green-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {currentQuestionIndex === quizData.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
*/