import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, BrainCircuit, Zap, Loader2, Wand2, Globe } from 'lucide-react';
import FileUploader from './FileUploader';
import FilePreview from './FilePreview';
import { getSocket } from '../socket';
import { useToast } from '../hooks/useToast';
import { Language } from '../contexts/SettingsContext';

interface UploadedFile {
  fileId: string;
  filename: string;
}

type ModuleLength = 'Short' | 'Medium' | 'Long';

const GenerateModulePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]);
  const [moduleLength, setModuleLength] = useState<ModuleLength>('Medium');
  const [moduleLanguage, setModuleLanguage] = useState<Language>('id-ID');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const socket = getSocket();

    const handleModuleStatus = (data: { status: string; message: string; moduleId?: string }) => {
      setStatusMessage(data.message);
      if (data.status === 'completed' && data.moduleId) {
        addToast('Module generated successfully!', 'success');
        setIsGenerating(false);
        navigate(`/app/play-module/${data.moduleId}`);
      } else if (data.status === 'failed') {
        addToast(data.message, 'error');
        setIsGenerating(false);
      }
    };

    socket.on('module_status', handleModuleStatus);

    return () => {
      socket.off('module_status', handleModuleStatus);
    };
  }, [navigate, addToast]);

  const handleUploadComplete = (newFiles: UploadedFile[]) => {
    setStagedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileIdToRemove: string) => {
    setStagedFiles(prev => prev.filter(file => file.fileId !== fileIdToRemove));
  };

  const handleGenerate = () => {
    const socket = getSocket();
    setIsGenerating(true);
    setStatusMessage('Initializing module generation...');
    socket.emit('generate_module', {
      prompt,
      fileIds: stagedFiles.map(f => f.fileId),
      moduleLength,
      moduleLanguage,
    });
  };

  const lengthOptions: { id: ModuleLength; label: string; description: string }[] = [
    { id: 'Short', label: 'Short', description: 'A brief overview (1 response)' },
    { id: 'Medium', label: 'Medium', description: 'A detailed explanation (3 responses)' },
    { id: 'Long', label: 'Long', description: 'A comprehensive lesson (5 responses)' },
  ];

  const languageOptions: { id: Language; label: string; flag: string }[] = [
    { id: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { id: 'en-US', label: 'English', flag: '🇺🇸' },
    { id: 'th-TH', label: 'Thai', flag: '🇹🇭' },
    { id: 'cmn-CN', label: 'Mandarin', flag: '🇨🇳' },
    { id: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black">Generate Zipo Module</h1>
              <p className="text-gray-600">Create a new, self-contained learning module.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Step 1: Prompt */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Wand2 size={24} className="text-black" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Your Topic</h2>
                    <p className="text-gray-500">What would you like to learn about?</p>
                </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Explain how photosynthesis works' or 'Compare SQL and NoSQL databases'..."
              className="w-full h-28 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black resize-none transition-all bg-white"
              disabled={isGenerating}
            />
          </div>

          {/* Step 2: Files (Optional) */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-black" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Add Documents (Optional)</h2>
                    <p className="text-gray-500">Provide documents for context-specific modules.</p>
                </div>
            </div>
            <FilePreview files={stagedFiles} onRemoveFile={handleRemoveFile} />
            <div className="mt-4">
                <FileUploader onUploadComplete={handleUploadComplete} disabled={isGenerating || stagedFiles.length >= 5} existingFileCount={stagedFiles.length} />
            </div>
          </div>

          {/* Step 3: Language Selection */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Globe size={24} className="text-black" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Module Language</h2>
                    <p className="text-gray-500">Select the speech language for this module.</p>
                </div>
            </div>
            <div className="relative">
              <select
                value={moduleLanguage}
                onChange={(e) => setModuleLanguage(e.target.value as Language)}
                disabled={isGenerating}
                className="w-full appearance-none p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white pr-10"
              >
                {languageOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.flag} {opt.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Step 4: Module Length */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BrainCircuit size={24} className="text-black" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Module Length</h2>
                    <p className="text-gray-500">Choose the depth of the explanation.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setModuleLength(opt.id)}
                  className={`p-6 text-left rounded-xl border-2 transition-all duration-200 ${moduleLength === opt.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  disabled={isGenerating}>
                  <h3 className="font-bold text-lg text-black">{opt.label}</h3>
                  <p className="text-gray-600 text-sm">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end items-center pt-4 gap-4">
            {isGenerating && <p className='text-gray-600 animate-pulse'>{statusMessage}</p>}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
              {isGenerating ? (
                <><Loader2 className="animate-spin" size={20} /> Generating...</>
              ) : (
                <><Zap size={20} /> Generate</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateModulePage;
