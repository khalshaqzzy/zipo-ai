import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Upload } from 'lucide-react';
import ModuleList from './ModuleList';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Callback function to start a new learning session. */
  onStartSession: () => void;
}

/**
 * The Dashboard component serves as the main landing page after a user logs in.
 * It displays a welcome message and quick action buttons for starting new sessions or generating modules.
 */
const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const [username, setUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

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
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".zipo"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onStartSession()}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200"
              >
                Start New Session
              </button>
              <button 
                onClick={() => navigate('/app/generate-module')}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Generate Zipo Module
              </button>
              <button 
                onClick={handleImportClick}
                disabled={isImporting}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload size={20} />
                {isImporting ? 'Importing...' : 'Import Zipo Module'}
              </button>
            </div>
          </div>
          <ModuleList />
        </div>
      </div>
    </>
  );
};

export default Dashboard;