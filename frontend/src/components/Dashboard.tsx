import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Upload, WifiOff } from 'lucide-react';
import ModuleList from './ModuleList';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import JSZip from 'jszip';
import { LocalModule } from '../App';
import { useOnlineStatus } from '../contexts/OnlineStatusContext';

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Callback function to start a new learning session. */
  onStartSession: () => void;
  setLocalModuleData: (data: LocalModule) => void;
}

/**
 * The Dashboard component serves as the main landing page after a user logs in.
 * It displays a welcome message and quick action buttons for starting new sessions or generating modules.
 */
const Dashboard: React.FC<DashboardProps> = ({ onStartSession, setLocalModuleData }) => {
  const [username, setUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const localPlayFileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { isOnline, reportNetworkError } = useOnlineStatus();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
        } else {
          reportNetworkError();
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
        reportNetworkError();
      }
    };

    fetchProfile();
  }, [reportNetworkError]);

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleOfflinePlayClick = () => {
    localPlayFileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('zipo_module', file);

    setIsImporting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/modules/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      addToast('Module imported successfully!', 'success');
      // A simple way to refresh the module list
      window.location.reload();
    } catch (error) {
      console.error('Error importing module:', error);
      addToast('Failed to import module.', 'error');
    } finally {
      setIsImporting(false);
      // Reset file input
      if(importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    }
  };

  const handleLocalFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addToast('Reading local module...', 'info');
    try {
        const zip = await JSZip.loadAsync(file);
        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) {
            throw new Error('Invalid .zipo file: manifest.json not found.');
        }
        const manifestContent = await manifestFile.async('string');
        const manifestData = JSON.parse(manifestContent);

        setLocalModuleData(manifestData);
        navigate('/app/play-local');

    } catch (error) {
        console.error('Error playing local module:', error);
        addToast('Could not play local module. File may be corrupt.', 'error');
    } finally {
        if (localPlayFileInputRef.current) {
            localPlayFileInputRef.current.value = '';
        }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".zipo,application/zip"
      />
      <input
        type="file"
        ref={localPlayFileInputRef}
        onChange={handleLocalFileSelect}
        className="hidden"
        accept=".zipo,application/zip"
      />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              Welcome back, <span className="font-bold text-black">{username || '...'}</span>!
            </h1>
            <p className="text-gray-600">Continue your learning journey with Zipo.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => onStartSession()}
                disabled={!isOnline}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start New Session
              </button>
              <button 
                onClick={() => navigate('/app/generate-module')}
                disabled={!isOnline}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={20} />
                Generate Zipo Module
              </button>
              <button 
                onClick={handleImportClick}
                disabled={!isOnline || isImporting}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} />
                {isImporting ? 'Importing...' : 'Import Zipo Module'}
              </button>
              <button 
                onClick={handleOfflinePlayClick}
                className={`font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  !isOnline 
                    ? 'bg-black text-white animate-pulse shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200 text-black'
                }`}
              >
                <WifiOff size={20} />
                Offline Playback
              </button>
            </div>
          </div>

          {!isOnline && (
            <div className="mt-8 p-6 bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-4 animate-in fade-in duration-500">
              <WifiOff className="w-8 h-8 text-gray-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-black text-lg">You are currently offline</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Online features like generating new sessions or modules are disabled. You can still use 'Offline Playback' to open downloaded `.zipo` files.
                </p>
              </div>
            </div>
          )}

          <ModuleList />
        </div>
      </div>
    </>
  );
};

export default Dashboard;