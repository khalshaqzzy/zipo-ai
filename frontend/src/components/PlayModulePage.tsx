import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { ArrowLeft, Loader2, Play, Pause, RotateCcw, Download } from 'lucide-react';
import { Stage, Layer, Text as KonvaText, Rect, Arrow, Circle } from 'react-konva';
import zipoIcon from '../../assets/zipo_white.png';
import { LocalModule } from '../App';

interface Command {
  command: string;
  payload: any;
  delay?: number;
}

interface PlayModulePageProps {
    isLocal: boolean;
    localModuleData?: LocalModule | null;
}

const PlayModulePage: React.FC<PlayModulePageProps> = ({ isLocal, localModuleData }) => {
  const [title, setTitle] = useState('');
  const [commandQueue, setCommandQueue] = useState<Command[]>([]);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [canvasObjects, setCanvasObjects] = useState<any[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);

  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { play, cancel, isSpeaking } = useAudioPlayer();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  const fetchModuleCommands = useCallback(async () => {
    if (!moduleId) {
      navigate('/app');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const moduleDetailsResponse = await fetch(`/api/modules/${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!moduleDetailsResponse.ok) throw new Error('Failed to fetch module details.');
      const moduleDetails = await moduleDetailsResponse.json();
      setTitle(moduleDetails.title || 'Untitled Module');

      const response = await fetch(`/api/modules/${moduleId}/play`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch module playback data.');
      const data: Command[] = await response.json();
      setCommandQueue(data);
      setTranscript(data.filter(cmd => cmd.command === 'speak').map(cmd => cmd.payload.text));

    } catch (err) {
      setError((err as Error).message);
      addToast((err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, navigate, addToast]);

  useEffect(() => {
    if (isLocal) {
        if (localModuleData) {
            setTitle(localModuleData.title);
            setCommandQueue(localModuleData.canvasState);
            setTranscript(localModuleData.canvasState.filter(cmd => cmd.command === 'speak').map(cmd => cmd.payload.text));
            setIsLoading(false);
        } else {
            addToast('No local module data found. Redirecting...', 'error');
            navigate('/app');
        }
    } else {
        fetchModuleCommands();
    }
  }, [isLocal, localModuleData, fetchModuleCommands, navigate, addToast]);

  

  // Effect to measure the canvas container AFTER the animation is triggered
  useLayoutEffect(() => {
    const checkSize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
        }
      }
    };

    if (isCanvasVisible) {
      // Wait for the animation to finish, then check the size.
      const timer = setTimeout(checkSize, 800); // 700ms animation + 100ms buffer
      return () => clearTimeout(timer);
    }
  }, [isCanvasVisible]);

  // Effect to handle window resize events
  useLayoutEffect(() => {
    const checkSize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Command processing logic
  useEffect(() => {
    if (isPlaying && isCanvasVisible && !isProcessing && commandQueue.length > 0 && currentStep < commandQueue.length) {
      const command = commandQueue[currentStep];
      setIsProcessing(true);

      // Wait for animation to finish on the very first step
      const startDelay = currentStep === 0 ? 800 : 0;

      setTimeout(() => {
        processCommand(command).then(() => {
          setCurrentStep(prev => prev + 1);
          setIsProcessing(false);
        });
      }, startDelay);

    } else if (isPlaying && currentStep >= commandQueue.length) {
      setIsPlaying(false); // Stop playing when queue is empty
    }
  }, [isPlaying, isCanvasVisible, isProcessing, commandQueue, currentStep]);

  const processCommand = (command: Command): Promise<void> => {
    return new Promise(resolve => {
        switch (command.command) {
            case 'speak':
                setCurrentTranscript(command.payload.text);
                play(command.payload.audioContent, () => {
                    setCurrentTranscript('');
                    resolve();
                });
                break;
            case 'clearCanvas':
                setCanvasObjects([]);
                setTimeout(resolve, command.delay || 500);
                break;
            case 'createText':
            case 'drawArrow':
            case 'drawRectangle':
            case 'drawCircle':
            case 'createTable':
                setCanvasObjects(prev => [...prev, { ...command, id: `${command.command}-${Date.now()}-${Math.random()}` }]);
                setTimeout(resolve, command.delay || 500);
                break;
            case 'fillTable':
                setCanvasObjects(prev => prev.map(obj =>
                    obj.payload.id === command.payload.tableId
                    ? { ...obj, payload: { ...obj.payload, cells: [...(obj.payload.cells || []), { ...command.payload }] } }
                    : obj
                ));
                setTimeout(resolve, command.delay || 500);
                break;
            default:
                console.warn(`Unknown command: ${command.command}`);
                resolve();
        }
    });
  };

  useEffect(() => {
    transcriptScrollRef.current?.querySelector(`[data-step="${currentStep}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep]);

  const handlePlayPause = () => {
    // Trigger animation if it's the very first play
    if (!isCanvasVisible) {
      setIsCanvasVisible(true);
    }

    // If at the end, reset and then play
    if (currentStep >= commandQueue.length && commandQueue.length > 0) {
      handleReset();
      setTimeout(() => {
        setIsCanvasVisible(true);
        setIsPlaying(true);
      }, 200); // Delay to allow state to reset
    } else {
      // Otherwise, just toggle play/pause
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    cancel();
    setIsPlaying(false);
    setCurrentStep(0);
    setCanvasObjects([]);
    setCurrentTranscript('');
    setIsCanvasVisible(false); // Collapse the canvas
  };

  const handleDownload = async () => {
    if (!moduleId) return;

    addToast('Preparing download...', 'info');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/modules/${moduleId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Download failed. Could not fetch module.');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'module.zipo'; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      addToast('Download started!', 'success');

    } catch (error) {
      console.error('Download error:', error);
      addToast((error as Error).message, 'error');
    }
  };

  const renderCanvasObject = (obj: any) => {
    const { command, payload, id } = obj;
    switch (command) {
      case 'createText':
        return <KonvaText key={id} x={payload.x} y={payload.y} text={payload.text} fontSize={payload.fontSize || 18} fill={payload.color || '#333'} />;
      case 'drawArrow':
        return <Arrow key={id} points={payload.points} pointerLength={8} pointerWidth={8} fill={payload.color || '#333'} stroke={payload.color || '#333'} strokeWidth={3} />;
      case 'drawRectangle':
        return <Rect key={id} x={payload.x} y={payload.y} width={payload.width} height={payload.height} fill={payload.color} stroke="#333" strokeWidth={2} cornerRadius={5}/>;
      case 'drawCircle':
        return <Circle key={id} x={payload.x} y={payload.y} radius={payload.radius} fill={payload.color} stroke="#333" strokeWidth={2} />;
      case 'createTable':
        const headerHeight = payload.rowHeight;
        return (
          <React.Fragment key={id}>
            {payload.headers.map((header: string, i: number) => {
              const colX = payload.x + payload.colWidths.slice(0, i).reduce((a: number, b: number) => a + b, 0);
              return (
                <React.Fragment key={`header-${i}`}>
                  <Rect x={colX} y={payload.y} width={payload.colWidths[i]} height={headerHeight} stroke="#333" strokeWidth={1} />
                  <KonvaText x={colX + 5} y={payload.y + 10} text={header} fontStyle="bold" fontSize={14} />
                </React.Fragment>
              );
            })}
            {[...Array(payload.rows -1)].map((_, rowIndex) => (
                 [...Array(payload.cols)].map((_, colIndex) => {
                    const cellX = payload.x + payload.colWidths.slice(0, colIndex).reduce((a:number, b:number) => a + b, 0);
                    const cellY = payload.y + headerHeight + (rowIndex * payload.rowHeight);
                    return <Rect key={`cell-${rowIndex}-${colIndex}`} x={cellX} y={cellY} width={payload.colWidths[colIndex]} height={payload.rowHeight} stroke="#333" strokeWidth={1} />
                 })
            ))}
            {payload.cells?.map((cell: any, i: number) => {
               const cellX = payload.x + payload.colWidths.slice(0, cell.col).reduce((a:number, b:number) => a + b, 0);
               const cellY = payload.y + (cell.row * payload.rowHeight);
               return <KonvaText key={`fill-${i}`} x={cellX + 5} y={cellY + 10} text={cell.text} fontSize={14} />
            })}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-12 h-12 text-black animate-spin" /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600">Error: {error}</div>;
  }

  const totalSteps = commandQueue.length;
  const speakCommands = commandQueue.filter(c => c.command === 'speak');
  const currentSpeakIndex = commandQueue.slice(0, currentStep).filter(c => c.command === 'speak').length;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/app')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-black truncate">{title}</h1>
                    <p className="text-sm text-gray-500">Module Playback {isLocal && "(Local)"}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handlePlayPause} disabled={commandQueue.length === 0} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : (currentStep >= totalSteps && totalSteps > 0 ? 'Replay' : 'Play')}</span>
                </button>
                <button onClick={handleReset} className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-all">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                </button>
                {!isLocal && (
                    <button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                    </button>
                )}
            </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
            <div ref={canvasContainerRef} className={`h-full bg-gray-50 relative transition-all duration-700 ease-in-out ${isCanvasVisible ? 'w-2/3' : 'w-0'}`}>
                {canvasSize.width > 0 && (
                    <Stage width={canvasSize.width} height={canvasSize.height}>
                        <Layer key={canvasObjects.length}>{canvasObjects.map(renderCanvasObject)}</Layer>
                    </Stage>
                )}
                {currentTranscript && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-6 text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0"><img src={zipoIcon} alt="Bot icon" className="w-7 h-7" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-gray-300">Zipo</span><div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-xs text-white/70">LIVE</span></div></div>
                        <p className="text-white leading-relaxed text-lg font-medium">{currentTranscript}</p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div ref={transcriptScrollRef} className={`h-full border-l border-gray-200 flex flex-col overflow-y-auto transition-all duration-700 ease-in-out ${isCanvasVisible ? 'w-1/3' : 'w-full'}`}>
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-black">Transcript</h3>
                    <p className="text-sm text-gray-500">{currentSpeakIndex} / {speakCommands.length} spoken parts</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-black h-1.5 rounded-full transition-all duration-300" style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}></div>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    {transcript.map((text, index) => {
                        const commandIndex = commandQueue.findIndex(cmd => cmd.command === 'speak' && cmd.payload.text === text);
                        const isCurrent = isSpeaking && commandIndex === currentStep;
                        const isPlayed = commandIndex < currentStep;
                        return (
                            <div key={index} data-step={commandIndex} className={`p-3 rounded-lg text-sm transition-all duration-300 ${isCurrent ? 'bg-black text-white shadow-lg' : isPlayed ? 'bg-gray-200 text-black' : 'bg-gray-100 text-gray-600'}`}>
                                {text}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlayModulePage;