import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Play, Zap } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useOnlineStatus } from '../contexts/OnlineStatusContext';

interface IModule {
    _id: string;
    title: string;
    moduleLength: 'Short' | 'Medium' | 'Long';
    updatedAt: string;
}

const ModuleList: React.FC = () => {
    const [modules, setModules] = useState<IModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { reportNetworkError } = useOnlineStatus();

    useEffect(() => {
        const fetchModules = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/modules', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch modules. You might be offline.');
                const data = await response.json();
                setModules(data);
            } catch (error) {
                console.error("Fetch modules failed, attempting to read from cache.", error);
                reportNetworkError(); // Set UI to offline mode

                // The name must match the one in sw.js
                const API_CACHE_NAME = 'zipo-api-cache-v1';
                caches.open(API_CACHE_NAME).then(cache => {
                    // This URL must exactly match the fetch request
                    cache.match('/api/modules').then(cachedResponse => {
                        if (cachedResponse) {
                            addToast('Offline: Loaded module list from cache.', 'info');
                            cachedResponse.json().then(data => {
                                setModules(data);
                            });
                        } else {
                            addToast('You are offline and no modules were found in the cache.', 'info');
                            setModules([]);
                        }
                    });
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchModules();
    }, [addToast, reportNetworkError]);

    const getLengthBadgeColor = (length: 'Short' | 'Medium' | 'Long') => {
        switch (length) {
            case 'Short': return 'bg-blue-100 text-blue-800';
            case 'Medium': return 'bg-purple-100 text-purple-800';
            case 'Long': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const ModuleCard: React.FC<{ module: IModule }> = ({ module }) => {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group relative">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-black truncate">{module.title}</p>
                        <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${getLengthBadgeColor(module.moduleLength)}`}>
                            {module.moduleLength}
                        </span>
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => navigate(`/app/play-module/${module._id}`)} className="flex items-center gap-2 bg-white/90 text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform"><Play size={20} /> Play Module</button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin text-black" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-6">My Zipo Modules</h2>
            
            {modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map(module => <ModuleCard key={module._id} module={module} />)}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Zap size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600">You haven't generated any modules yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Click "Generate Zipo Module" to create your first one!</p>
                </div>
            )}
        </div>
    );
};

export default ModuleList;
