import React, { useState } from 'react';
import InviteModal from './InviteModal';

const Sidebar = ({ workspace, documents, onCreateDocument, onSelectDocument, selectedDocId, activeUsers }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  const handleCreateDocument = (e) => {
    e.preventDefault();
    if (newDocTitle.trim()) {
      onCreateDocument(newDocTitle);
      setNewDocTitle('');
      setShowCreateDoc(false);
    }
  };

  return (
    <>
      <div className="w-64 bg-white border-r border-border h-full overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text mb-2">{workspace?.name}</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full px-3 py-2 text-sm text-primary border border-primary rounded hover:bg-purple-50"
          >
            Invite Members
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-text">Documents</h3>
              <button
                onClick={() => setShowCreateDoc(!showCreateDoc)}
                className="text-primary hover:text-purple-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {showCreateDoc && (
              <form onSubmit={handleCreateDocument} className="mb-3">
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-2 py-1 text-xs text-white bg-primary rounded hover:bg-purple-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateDoc(false);
                      setNewDocTitle('');
                    }}
                    className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => onSelectDocument(doc)}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                    selectedDocId === doc._id ? 'bg-purple-50 text-primary font-medium' : 'text-text'
                  }`}
                >
                  {doc.title}
                </button>
              ))}

              {documents.length === 0 && (
                <p className="text-xs text-gray-500 px-3 py-2">No documents yet</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-3">Active Users ({activeUsers.length})</h3>
            <div className="space-y-2">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-text">{user.userName}</span>
                </div>
              ))}

              {activeUsers.length === 0 && (
                <p className="text-xs text-gray-500">No active users</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && workspace && (
        <InviteModal workspace={workspace} onClose={() => setShowInviteModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
