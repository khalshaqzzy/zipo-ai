import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface OnlineStatusContextType {
  isOnline: boolean;
  renderKey: number; // A key that changes to force re-renders
  reportNetworkError: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [renderKey, setRenderKey] = useState<number>(0);

  const updateStatus = useCallback((online: boolean) => {
    setIsOnline(online);
    setRenderKey(key => key + 1); // Increment key to force re-render
    console.log(`[OnlineStatusProvider] Status changed. isOnline: ${online}, renderKey: ${renderKey + 1}`);
  }, [renderKey]);


  const reportNetworkError = useCallback(() => {
    if (isOnline) {
      console.log('[OnlineStatusProvider] Network error reported, forcing OFFLINE state.');
      updateStatus(false);
    }
  }, [isOnline, updateStatus]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OnlineStatusProvider] "online" event fired by browser.');
      updateStatus(true);
    }
    const handleOffline = () => {
      console.log('[OnlineStatusProvider] "offline" event fired by browser.');
      updateStatus(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateStatus]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, renderKey, reportNetworkError }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};
