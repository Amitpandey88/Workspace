import React, { useState } from 'react';

const InviteModal = ({ workspace, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-text mb-4">Invite Members</h3>

        <p className="text-sm text-gray-600 mb-4">
          Share this code with your team members to join this workspace:
        </p>

        <div className="bg-gray-50 border border-border rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-primary tracking-wider mb-2">
              {workspace.inviteCode}
            </div>
            <button
              onClick={copyToClipboard}
              className="text-sm text-primary hover:text-purple-700 font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
