import React from 'react';

const StatusBadge = ({ isOnline }) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-success' : 'bg-danger'
        }`}
      ></span>
      <span className="text-sm font-medium text-text">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default StatusBadge;
