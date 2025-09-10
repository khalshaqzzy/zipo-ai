/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, Play, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface IQuizSummary {
    _id: string;
    title: string;
    status: 'active' | 'completed';
    score?: number;
    questionsCount: number;
    timeLeft?: number;
    updatedAt: string;
}

const RecentQuizzes: React.FC = () => {
    const [quizzes, setQuizzes] = useState<{ active: IQuizSummary[], completed: IQuizSummary[] }>({ active: [], completed: [] });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchQuizzes = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/quiz/recent', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch recent quizzes.');
                const data = await response.json();
                
                // Add questionsCount to each quiz object for display
                const enrichedData = {
                    active: data.active.map((q: any) => ({ ...q, questionsCount: q.questions.length })),
                    completed: data.completed.map((q: any) => ({ ...q, questionsCount: q.questions.length })),
                };
                setQuizzes(enrichedData);

            } catch (error) {
                addToast((error as Error).message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizzes();
    }, [addToast]);

    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min left`;
    };

    const QuizCard: React.FC<{ quiz: IQuizSummary }> = ({ quiz }) => {
        const isCompleted = quiz.status === 'completed';
        const scorePercentage = isCompleted && quiz.score !== undefined ? (quiz.score / quiz.questionsCount) * 100 : 0;

        return (
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group relative">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-slate-800 truncate">{quiz.title}</p>
                        <p className="text-sm text-slate-500">{quiz.questionsCount} questions</p>
                    </div>
                    {isCompleted ? (
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-lg text-green-600">{quiz.score}/{quiz.questionsCount}</p>
                            <p className="text-xs text-slate-500">{scorePercentage.toFixed(0)}%</p>
                        </div>
                    ) : (
                        <div className="text-right flex-shrink-0 ml-4 flex items-center gap-2 text-blue-600 font-semibold">
                            <Clock size={16} />
                            <span>{formatTimeLeft(quiz.timeLeft || 0)}</span>
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isCompleted ? (
                        <>
                            <button onClick={() => navigate(`/app/quiz/play/${quiz._id}`)} className="flex items-center gap-2 bg-white/90 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:scale-105 transition-transform"><Eye size={16} /> Review</button>
                            
                        </>
                    ) : (
                        <button onClick={() => navigate(`/app/quiz/play/${quiz._id}`)} className="flex items-center gap-2 bg-white/90 text-slate-800 font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform"><Play size={20} /> Continue</button>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Quizzes</h2>
            
            {quizzes.active.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Active</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizzes.active.map(quiz => <QuizCard key={quiz._id} quiz={quiz} />)}
                    </div>
                </div>
            )}

            {quizzes.completed.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Completed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizzes.completed.map(quiz => <QuizCard key={quiz._id} quiz={quiz} />)}
                    </div>
                </div>
            )}

            {quizzes.active.length === 0 && quizzes.completed.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500">You haven't taken any quizzes yet.</p>
                    <p className="text-sm text-slate-400 mt-2">Upload a document to get started!</p>
                </div>
            )}
        </div>
    );
};

export default RecentQuizzes;
*/