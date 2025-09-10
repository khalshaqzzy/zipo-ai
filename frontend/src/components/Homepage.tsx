import React from 'react';
import { MessageCircle, Upload, Eye, ArrowRight, Sparkles } from 'lucide-react';

interface HomepageProps {
  onStartSession: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onStartSession }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-lg">
            <Sparkles className="text-blue-500" size={20} />
            <span className="text-blue-600 font-medium">AI-Powered Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight">
            Ask Anything.
            <br />
            Learn Visually.
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience revolutionary conversational learning with AI that explains through both chat and synchronized visual breakdowns on our generative whiteboard.
          </p>
          
          <button
            onClick={onStartSession}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Start Your First Session
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-16">
          Why Choose Zipo?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Conversational Learning
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Engage in natural conversations with our AI tutor. Ask questions, get explanations, and dive deeper into topics through interactive dialogue.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Upload className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Upload Your Documents
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Upload PDFs, images, or text files and let our AI break them down into digestible, visual explanations tailored to your learning style.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Visual Breakdowns
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Watch concepts come to life on our generative whiteboard. Complex topics are broken down into clear, visual representations.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners who are already experiencing the future of education.
          </p>
          <button
            onClick={onStartSession}
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;