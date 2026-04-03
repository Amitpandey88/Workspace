import React from 'react';

const CursorPresence = ({ cursors }) => {
  if (!cursors || cursors.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none">
      {cursors.map((cursor) => (
        <div
          key={cursor.socketId}
          className="absolute pointer-events-none"
          style={{
            top: `${cursor.position?.top || 0}px`,
            left: `${cursor.position?.left || 0}px`
          }}
        >
          <div className="relative">
            <div className="w-0.5 h-5 bg-primary animate-pulse"></div>
            <div className="absolute top-6 left-0 bg-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorPresence;
