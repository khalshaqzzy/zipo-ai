/*
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Settings, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface QuizSetupPageProps {
  files: UploadedFile[];
  onGenerateQuiz: (instructions: string, questionCount: number) => void;
}

const QuizSetupPage: React.FC<QuizSetupPageProps> = ({ files, onGenerateQuiz }) => {
  const [instructions, setInstructions] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!instructions.trim()) {
      return;
    }
    
    setIsGenerating(true);
    try {
      await onGenerateQuiz(instructions, questionCount);
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyPresets = [
    {
      title: 'Easy Review',
      description: 'Basic comprehension questions with multiple choice format',
      prompt: 'Create easy multiple-choice questions focusing on basic comprehension and key facts from the documents. Make questions straightforward with clear correct answers.'
    },
    {
      title: 'Standard Assessment',
      description: 'Mixed question types testing understanding and application',
      prompt: 'Generate a balanced mix of multiple-choice and short-answer questions that test both understanding and application of concepts from the documents.'
    },
    {
      title: 'Advanced Challenge',
      description: 'Complex questions requiring critical thinking and analysis',
      prompt: 'Create challenging questions that require critical thinking, analysis, and synthesis of information from the documents. Include scenario-based questions and require detailed explanations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quiz Setup</h1>
              <p className="text-slate-600">Configure your personalized quiz</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Source Documents</h2>
              <p className="text-slate-600 text-sm">Quiz will be generated from these files</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-sm text-slate-500">Ready for quiz generation</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Quick Presets</h2>
              <p className="text-slate-600 text-sm">Choose a preset or customize your own instructions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {difficultyPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setInstructions(preset.prompt)}
                className="p-4 text-left rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {preset.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Quiz Instructions</h2>
              <p className="text-slate-600 text-sm">Tell the AI how to create your quiz</p>
            </div>
          </div>
          
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Example: Create a comprehensive quiz with multiple choice questions focusing on key concepts, definitions, and practical applications. Include some challenging questions that require critical thinking..."
            className="w-full h-32 p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200 bg-slate-50 hover:bg-white"
          />
          
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Be specific about question types, difficulty level, and focus areas</span>
          </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Number of Questions</h2>
              <p className="text-slate-600 text-sm">Choose between 5-15 questions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{questionCount}</div>
              <div className="text-sm text-slate-500">questions</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <input
              type="range"
              min="5"
              max="15"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${((questionCount - 5) / 10) * 100}%, #e2e8f0 ${((questionCount - 5) / 10) * 100}%, #e2e8f0 100%)`
              }}
            />
            
            <div className="flex justify-between text-sm text-slate-500">
              <span>5 questions</span>
              <span>Quick (10-15 min)</span>
              <span>15 questions</span>
            </div>
          </div>
        </div>

        
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!instructions.trim() || isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-12 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl flex items-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Generate Quiz!
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default QuizSetupPage;
*/