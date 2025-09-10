import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, Language } from '../contexts/SettingsContext';
import { ArrowRight, Check, Globe } from 'lucide-react';

// Import images directly for Vite to process
import tutorialLayoutOverview from '../../assets/tutorial/tutorial-layout-overview.png';
import tutorialChatPanel from '../../assets/tutorial/tutorial-chat-panel.png';
import tutorialCanvasControls from '../../assets/tutorial/tutorial-canvas-controls.png';
import tutorialDashboardGenerateButton from '../../assets/tutorial/tutorial-dashboard-generate-button.png';
import tutorialGenerateModulePage from '../../assets/tutorial/tutorial-generate-module-page.png';
import tutorialLiveConversation from '../../assets/tutorial/tutorial-live-conversation.png';
import tutorialNavigationBar from '../../assets/tutorial/tutorial-navigation-bar.png';

const TutorialPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const { language, setLanguage } = useSettings();
  const navigate = useNavigate();

  const tutorialSteps = [
    {
      title: "Welcome to Zipo!",
      description: "Let's get you started. First, select your preferred language for voice interactions. You can always change this later in the settings.",
      content: () => <LanguageSelector selected={language} onSelect={setLanguage} />,
      buttonText: "Continue"
    },
    {
      title: "Your Learning Cockpit",
      description: "Zipo has two main areas: the Chat Panel on the left where you guide the lesson, and the Visual Canvas on the right where concepts come to life.",
      image: tutorialLayoutOverview
    },
    {
      title: "Guiding the Conversation",
      description: "Use the input at the bottom to ask questions. You can attach documents with the paperclip icon or use your voice with the microphone button. Your conversation history is saved here.",
      image: tutorialChatPanel
    },
    {
      title: "Watch, Play, and Learn",
      description: "The canvas is where Zipo draws explanations. Use the controls at the top to Play, Pause, or Reset the visual animation at any time.",
      image: tutorialCanvasControls
    },
    {
      title: "Need a Deeper Dive? Generate a Module",
      description: "From your dashboard, click 'Generate Zipo Module'. This feature is perfect for creating a comprehensive, multi-step lesson on any topic.",
      image: tutorialDashboardGenerateButton
    },
    {
      title: "Tailor Your Lesson",
      description: "On the generation page, define your topic, add any relevant documents for context, and choose the desired length of the lesson. Then, just click Generate!",
      image: tutorialGenerateModulePage
    },
    {
      title: "Talk Directly to Your Tutor",
      description: "Need to discuss something quickly? Start a Live Conversation for a real-time, voice-only chat with the Zipo Voice Agent. It's perfect for quick questions and follow-ups.",
      image: tutorialLiveConversation
    },
    {
      title: "Revisit Your Learning",
      description: "The navigation bar on the far left holds all your past sessions and modules. Click on any item to revisit your learning history at any time.",
      image: tutorialNavigationBar
    }
  ];

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/complete-tutorial', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      navigate('/app');
    } catch (error) {
      console.error("Failed to mark tutorial as complete", error);
      // Navigate to app anyway for a good user experience
      navigate('/app');
    }
  };

  const currentStepData = tutorialSteps[step];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">{currentStepData.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{currentStepData.description}</p>
          
          <div className="min-h-[350px] flex items-center justify-center bg-gray-100 rounded-xl p-6 border border-gray-200">
            {currentStepData.content ? currentStepData.content() : (
              <img src={currentStepData.image} alt={currentStepData.title} className="max-w-full max-h-[320px] rounded-lg shadow-md" />
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === index ? 'bg-black w-4' : 'bg-gray-300'}`} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button onClick={handleBack} className="text-gray-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                Back
              </button>
            )}
            <button 
              onClick={handleNext} 
              className="bg-black text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all transform hover:scale-105"
            >
              {step === tutorialSteps.length - 1 ? 'Get Started' : currentStepData.buttonText || 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LanguageSelector: React.FC<{ selected: Language, onSelect: (lang: Language) => void }> = ({ selected, onSelect }) => {
  const languages: { id: Language, name: string, flag: string }[] = [
    { id: 'id-ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { id: 'en-US', name: 'English', flag: '🇺🇸' },
    { id: 'th-TH', name: 'Thai', flag: '🇹🇭' },
    { id: 'cmn-CN', name: 'Mandarin', flag: '🇨🇳' },
    { id: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map(lang => (
          <button 
            key={lang.id} 
            onClick={() => onSelect(lang.id)} 
            className={`p-6 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${selected === lang.id ? 'border-black bg-gray-100' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="text-3xl">{lang.flag}</span>
            <div>
              <h3 className="font-bold text-lg text-black">{lang.name}</h3>
            </div>
            {selected === lang.id && <Check size={24} className="text-black ml-auto" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TutorialPage;
