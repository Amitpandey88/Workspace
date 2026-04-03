import { useState, useEffect } from 'react';
import { syncPendingChanges } from '../utils/syncQueue';

export const useOffline = (socket) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('Connection restored, syncing pending changes...');

      // Sync pending changes
      if (socket) {
        await syncPendingChanges(socket);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost, entering offline mode...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [socket]);

  return isOnline;
};
