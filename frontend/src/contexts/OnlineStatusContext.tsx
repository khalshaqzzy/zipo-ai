import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface OnlineStatusContextType {
  isOnline: boolean;
  reportNetworkError: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  const reportNetworkError = useCallback(() => {
    if (isOnline) {
      console.log('Network error reported, switching to offline mode.');
      setIsOnline(false);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser reported online.');
      setIsOnline(true);
    }
    const handleOffline = () => {
      console.log('Browser reported offline.');
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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