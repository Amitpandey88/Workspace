import React from 'react';

const OfflineBanner = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-danger text-white py-3 px-4 text-center z-50 animate-slide-down">
      <div className="flex items-center justify-center gap-2">
        <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
        <span className="font-medium">You are offline. Changes will be synced when connection is restored.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
