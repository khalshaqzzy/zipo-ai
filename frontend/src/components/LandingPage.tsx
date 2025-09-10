import React, { useState, useEffect } from 'react';
import zipoWhiteLogo from '../../assets/zipo_white.png';
import zipoBlackLogo from '../../assets/zipo_black.png';
import { 
  ArrowRight, 
  Sparkles, 
  MessageCircle, 
  Upload, 
  Eye,
  Users,
  Brain,
  Zap,
  TrendingUp,
  Bot,
  Mic,
  Volume2,
  ChevronRight,
  Wifi,
  WifiOff,
  Languages,
  Map,
  GraduationCap,
  Heart
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Floating transcript messages for demo
const transcriptMessages = [
  {
    id: 1,
    text: "Selamat datang! Mari belajar matematika dengan cara yang menyenangkan dan visual"
  },
  {
    id: 2,
    text: "Welcome! Let's explore science concepts through interactive visual explanations"
  },
  {
    id: 3,
    text: "สวัสดี! มาเรียนรู้ประวัติศาสตร์ผ่านการสนทนาและภาพประกอบที่น่าสนใจ"
  },
  {
    id: 4,
    text: "Chào bạn! Hãy khám phá ngôn ngữ thông qua AI và hình ảnh tương tác"
  },
  {
    id: 5,
    text: "你好！让我们通过对话式AI和可视化学习来掌握新知识"
  },
  {
    id: 6,
    text: "Bridging educational gaps across Southeast Asia with personalized AI learning"
  }
];

const features = [
  {
    icon: MessageCircle,
    title: "Conversational AI Learning",
    description: "Engage in natural conversations with our advanced AI tutor that adapts to your learning style and pace.",
    gradient: "from-gray-800 to-gray-900"
  },
  {
    icon: Eye,
    title: "Visual Explanations",
    description: "Watch complex concepts come to life on our generative whiteboard with real-time visual breakdowns.",
    gradient: "from-gray-700 to-gray-800"
  },
  {
    icon: Upload,
    title: "Document Analysis",
    description: "Upload PDFs, images, or text files and get instant AI-powered explanations with visual summaries.",
    gradient: "from-gray-600 to-gray-700"
  },
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "Zipo understands your knowledge gaps and creates personalized learning paths just for you.",
    gradient: "from-gray-800 to-black"
  },
  {
    icon: Zap,
    title: "Instant Understanding",
    description: "Get immediate answers to your questions with synchronized audio and visual explanations.",
    gradient: "from-gray-700 to-gray-900"
  }
];

const impactStats = [
  {
    number: "685M",
    label: "People in SEA",
    description: "Potential learners across Southeast Asia region",
    icon: Users,
    gradient: "from-gray-800 to-black"
  },
  {
    number: "1000+",
    label: "Languages",
    description: "Linguistic diversity we aim to support",
    icon: Languages,
    gradient: "from-gray-700 to-gray-900"
  },
  {
    number: "60%",
    label: "Rural Population",
    description: "Learners with limited internet connectivity",
    icon: WifiOff,
    gradient: "from-gray-600 to-gray-800"
  },
  {
    number: "100%",
    label: "Offline Ready",
    description: "Core lessons work without internet connection",
    icon: Wifi,
    gradient: "from-gray-800 to-black"
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Continuous transcript cycling
    const transcriptInterval = setInterval(() => {
      setCurrentTranscriptIndex(prev => (prev + 1) % transcriptMessages.length);
    }, 4000);

    // Auto-cycle features
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);

    return () => {
      clearInterval(transcriptInterval);
      clearInterval(featureInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Minimal Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Minimal floating elements */}
        {mounted && [...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black/10 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 p-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-10 h-10 bg-cover bg-center rounded-xl shadow-sm"
                style={{ backgroundImage: `url(${zipoWhiteLogo})` }}
              >
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">
                Zipo
              </h1>
              <p className="text-xs text-gray-600 font-medium">AI Learning Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-gray-700 hover:text-black font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-20">
            <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 mb-8">
                <Map className="text-black" size={16} />
                <span className="text-black font-medium text-sm">Bridging Educational Inequality in Southeast Asia</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-8 leading-tight">
                Personalized AI Learning
                <br />
                <span className="text-gray-600">
                  for Everyone
                </span>
              </h1>
              
              <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transforming education across Southeast Asia with 
                <span className="text-black font-semibold"> conversational AI tutoring</span> and 
                <span className="text-black font-semibold"> real-time visual explanations</span>. 
                Designed for linguistic diversity and offline accessibility.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <button
                  onClick={onGetStarted}
                  className="bg-black hover:bg-gray-800 text-white font-bold px-10 py-5 rounded-xl flex items-center gap-4 transition-all duration-300 shadow-lg group"
                >
                  <GraduationCap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Start Learning Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Mission Section */}
      <section className="relative z-10 px-6 py-40 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-8 py-4 mb-12 shadow-sm">
              <Heart className="text-black" size={16} />
              <span className="text-black font-semibold text-sm tracking-wide">OUR MISSION</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-bold text-black mb-8 leading-tight">
              Addressing Educational
              <br />
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Inequality
              </span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
              <span className="text-black font-bold">685 million people</span> across Southeast Asia deserve equal access to quality education.{' '}
              Zipo bridges the gap with <span className="text-black font-bold">AI-powered learning</span> that adapts to local languages and works offline.
            </p>
          </div>
          
          {/* Mission Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-24">
            <div className="group">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Languages className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-2">Linguistic Diversity</h3>
                    <div className="w-12 h-1 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Supporting over <span className="font-bold text-black">1,000 languages</span> across Southeast Asia with hyper-local understanding 
                  that goes beyond simple translation, powered by <span className="font-bold text-purple-600">SEA-LION LLM</span>.
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">ID</div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">TH</div>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">VN</div>
                    <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">MY</div>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">+996 more</span>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <WifiOff className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-2">Offline Accessibility</h3>
                    <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  <span className="font-bold text-emerald-600">.zipo offline modules</span> ensure core visual and audio lessons work without internet, 
                  making quality education accessible even in <span className="font-bold text-black">remote areas</span>.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">60% Rural Population</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Limited Connectivity</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-2">Adaptive Learning</h3>
                    <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Personalized <span className="font-bold text-blue-600">progressive web app</span> that adapts to individual learning styles, 
                  pace, and cultural context for truly <span className="font-bold text-black">equitable education</span>.
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">100%</div>
                    <div className="text-xs text-gray-500 font-medium">Personalized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">24/7</div>
                    <div className="text-xs text-gray-500 font-medium">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">∞</div>
                    <div className="text-xs text-gray-500 font-medium">Adaptive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Visualization */}
          <div className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-4xl font-bold mb-8">Regional Impact Potential</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-black mb-2">685M</div>
                  <div className="text-gray-300 font-medium">People in SEA</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black mb-2">1000+</div>
                  <div className="text-gray-300 font-medium">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black mb-2">60%</div>
                  <div className="text-gray-300 font-medium">Rural Population</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black mb-2">100%</div>
                  <div className="text-gray-300 font-medium">Offline Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-black mb-6">
              Why Choose <span className="text-gray-600">Zipo</span>?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover the revolutionary features that make learning more engaging, effective, and enjoyable than ever before.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = index === activeFeature;
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                      isActive 
                        ? 'bg-gray-50 shadow-lg border-gray-300 scale-105' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.gradient} shadow-lg ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Demo */}
            <div className="relative">
              <div className="bg-black rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Zipo Learning Canvas</span>
                </div>
                
                <div className="bg-white rounded-2xl p-8 h-80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                  
                  {/* Animated demo content */}
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-black mb-2">
                      {features[activeFeature].title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Interactive learning in progress...
                    </p>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gray-300 rounded-full animate-bounce opacity-80"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gray-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 -right-6 w-4 h-4 bg-gray-500 rounded-full animate-bounce opacity-80" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
                
                {/* Fixed AI Transcript */}
                {transcriptMessages[currentTranscriptIndex] && (
                  <div className="absolute -bottom-24 left-0 right-0 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-black shadow-2xl border border-gray-200 mx-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-bold text-black">Zipo AI</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-600 font-medium">LIVE PREVIEW</span>
                            </div>
                          </div>
                          <p className="text-black leading-relaxed text-base font-medium">
                            {transcriptMessages[currentTranscriptIndex].text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Volume2 className="w-5 h-5 text-gray-600" />
                          <Mic className="w-5 h-5 text-green-500 animate-pulse" />
                        </div>
                      </div>
                      
                      {/* Animated waveform */}
                      <div className="flex items-center justify-center gap-1 mt-4">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-black rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 16 + 6}px`,
                              animationDelay: `${i * 100}ms`,
                              animationDuration: '1.2s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative z-10 px-6 py-32 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <TrendingUp className="text-white" size={20} />
              <span className="font-medium text-white">Regional Impact</span>
            </div>
            
            <h2 className="text-5xl font-bold mb-6">
              Transforming <span className="text-gray-300">Southeast Asia</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Addressing educational inequality across the region with AI-powered learning solutions designed for local needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`relative group transition-all duration-500 hover:-translate-y-4 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    
                    {/* Number */}
                    <div className="text-4xl font-bold mb-3 text-white">
                      {stat.number}
                    </div>
                    
                    {/* Label */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      {stat.label}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {stat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Innovation */}
      <section className="relative z-10 px-6 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-6 py-3 mb-8">
              <Zap className="text-black" size={16} />
              <span className="text-black font-medium text-sm">Advanced Technology</span>
            </div>
            
            <h2 className="text-5xl font-bold text-black mb-6">
              Powered by <span className="text-gray-600">SEA-LION LLM</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Our key innovation integrates the SEA-LION Large Language Model for hyper-local understanding 
              and React-Konva as the LLM's visual tool for real-time generative whiteboard experiences.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Innovation 1 */}
            <div className={`group transition-all duration-700 hover:-translate-y-2 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '100ms' }}>
              <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg relative overflow-hidden h-full">
                <div className="w-16 h-16 bg-black rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Languages className="text-white" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold text-black mb-4">
                  SEA-LION Integration
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Leveraging Southeast Asia's most advanced language model for true cultural and linguistic understanding, 
                  going beyond simple translation to provide contextually relevant learning experiences.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Cultural context awareness</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Local language nuances</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Regional educational standards</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Innovation 2 */}
            <div className={`group transition-all duration-700 hover:-translate-y-2 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
              <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg relative overflow-hidden h-full">
                <div className="w-16 h-16 bg-black rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="text-white" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold text-black mb-4">
                  React-Konva Canvas
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Real-time generative whiteboard powered by React-Konva, serving as the LLM's visual tool 
                  to create dynamic, interactive explanations that adapt to each learner's needs.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Real-time visual generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Interactive diagrams</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Synchronized explanations</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Innovation 3 */}
            <div className={`group transition-all duration-700 hover:-translate-y-2 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
              <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg relative overflow-hidden h-full">
                <div className="w-16 h-16 bg-black rounded-2xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <WifiOff className="text-white" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold text-black mb-4">
                  .zipo Offline Modules
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Downloadable, interactive lessons that work without internet connection, ensuring 
                  core visual and audio learning experiences remain effective even on unstable connections.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Offline-first design</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Progressive web app</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm text-gray-600">Adaptive modality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <Sparkles className="text-white" size={20} />
                <span className="font-medium">Join the Educational Revolution</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-6">
                Ready to Bridge the Gap?
              </h2>
              <p className="text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Be part of the solution to educational inequality in Southeast Asia. 
                Start your personalized learning journey with Zipo today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={onGetStarted}
                  className="bg-white text-black font-bold px-10 py-5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg flex items-center gap-3 group"
                >
                  <GraduationCap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Start Learning
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black text-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center relative z-10">
            {/* Logo */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <img src={zipoBlackLogo} alt="Zipo Logo" className="w-24 h-24" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Zipo
                </h1>
                <p className="text-gray-400 text-lg font-medium tracking-wide">AI Learning Platform</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-2xl text-gray-300 leading-relaxed font-light">
                Bridging educational inequality across Southeast Asia through{' '}
                <span className="text-white font-medium">
                  AI-powered conversational learning
                </span>{' '}
                and{' '}
                <span className="text-white font-medium">
                  offline-accessible visual explanations
                </span>
                .
              </p>
              <p className="text-xl text-gray-400 mt-4 font-light">
                Designed for diversity. Built for everyone.
              </p>
            </div>
            
            {/* Decorative Elements */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;