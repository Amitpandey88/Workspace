import React, { useState } from 'react';

const ConflictModal = ({ localVersion, serverVersion, onResolve }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const handleResolve = () => {
    if (selectedVersion) {
      onResolve(selectedVersion === 'local' ? localVersion : serverVersion);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-bold text-text mb-4">Conflict Detected</h3>

        <p className="text-sm text-gray-600 mb-6">
          The document was edited by another user while you were offline. Please choose which version to keep:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Local Version */}
          <div
            onClick={() => setSelectedVersion('local')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedVersion === 'local'
                ? 'border-primary bg-purple-50'
                : 'border-border hover:border-primary'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-text">Your Version (Local)</h4>
              <input
                type="radio"
                checked={selectedVersion === 'local'}
                onChange={() => setSelectedVersion('local')}
                className="w-4 h-4 text-primary"
              />
            </div>
            <div className="bg-white border border-border rounded p-3 max-h-64 overflow-auto">
              <pre className="text-sm text-text whitespace-pre-wrap">
                {localVersion.content}
              </pre>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Edited: {new Date(localVersion.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Server Version */}
          <div
            onClick={() => setSelectedVersion('server')}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedVersion === 'server'
                ? 'border-primary bg-purple-50'
                : 'border-border hover:border-primary'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-text">Server Version</h4>
              <input
                type="radio"
                checked={selectedVersion === 'server'}
                onChange={() => setSelectedVersion('server')}
                className="w-4 h-4 text-primary"
              />
            </div>
            <div className="bg-white border border-border rounded p-3 max-h-64 overflow-auto">
              <pre className="text-sm text-text whitespace-pre-wrap">
                {serverVersion.content}
              </pre>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Edited: {new Date(serverVersion.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleResolve}
            disabled={!selectedVersion}
            className="px-6 py-2 text-white bg-primary rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
