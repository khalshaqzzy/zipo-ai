import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface OnlineStatusContextType {
  isOnline: boolean;
  reportNetworkError: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    console.log('[OnlineStatusProvider] Initializing state:', navigator.onLine);
    return navigator.onLine;
  });

  const reportNetworkError = useCallback(() => {
    if (isOnline) { // Only update if the state is changing
      console.log('[OnlineStatusProvider] Network error reported by app, forcing OFFLINE state.');
      setIsOnline(false);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OnlineStatusProvider] "online" event fired by browser. Setting state to ONLINE.');
      setIsOnline(true);
    }
    const handleOffline = () => {
      console.log('[OnlineStatusProvider] "offline" event fired by browser. Setting state to OFFLINE.');
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    console.log('[OnlineStatusProvider] Event listeners attached.');

    return () => {
      console.log('[OnlineStatusProvider] Event listeners removed.');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  console.log('[OnlineStatusProvider] Rendering with isOnline =', isOnline);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, reportNetworkError }}>
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