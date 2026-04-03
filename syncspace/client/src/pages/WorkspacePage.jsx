import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../hooks/useSocket';
import { useOffline } from '../hooks/useOffline';
import Sidebar from '../components/Workspace/Sidebar';
import DocumentEditor from '../components/Editor/DocumentEditor';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import OfflineBanner from '../components/UI/OfflineBanner';
import StatusBadge from '../components/UI/StatusBadge';
import api from '../utils/api';

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentWorkspace, setCurrentWorkspace, activeUsers, setActiveUsers } = useWorkspace();
  const socket = useSocket();
  const isOnline = useOffline(socket);

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [view, setView] = useState('split'); // split, editor, tasks

  useEffect(() => {
    if (id) {
      fetchWorkspace();
      fetchDocuments();
    }
  }, [id]);

  // Join workspace room via socket
  useEffect(() => {
    if (socket && id && user) {
      socket.emit('join:workspace', {
        workspaceId: id,
        userId: user.id,
        userName: user.name
      });

      // Listen for workspace users
      socket.on('workspace:users', (users) => {
        setActiveUsers(users);
      });

      socket.on('user:joined', (data) => {
        setActiveUsers((prev) => [...prev, data]);
      });

      socket.on('user:left', (data) => {
        setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      return () => {
        socket.emit('leave:workspace', { workspaceId: id });
        socket.off('workspace:users');
        socket.off('user:joined');
        socket.off('user:left');
      };
    }
  }, [socket, id, user]);

  const fetchWorkspace = async () => {
    try {
      const response = await api.get(`/workspaces/${id}`);
      if (response.data.success) {
        setCurrentWorkspace(response.data.workspace);
      }
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
      navigate('/dashboard');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/workspaces/${id}/documents`);
      if (response.data.success) {
        setDocuments(response.data.documents);
        if (response.data.documents.length > 0 && !selectedDocument) {
          setSelectedDocument(response.data.documents[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleCreateDocument = async (title) => {
    try {
      const response = await api.post(`/workspaces/${id}/documents`, {
        title,
        content: ''
      });

      if (response.data.success) {
        setDocuments([...documents, response.data.document]);
        setSelectedDocument(response.data.document);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };

  return (
    <div className="h-screen flex flex-col">
      <OfflineBanner isOnline={isOnline} />

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-2xl font-bold text-primary hover:text-purple-700"
              >
                SyncSpace
              </button>
              <div className="text-lg font-semibold text-text">
                {currentWorkspace?.name}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Active users avatars */}
              <div className="flex items-center gap-2">
                {activeUsers.slice(0, 3).map((user, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm"
                    title={user.userName}
                  >
                    {user.userName?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xs">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>

              <StatusBadge isOnline={isOnline} />

              <span className="text-text">{user?.name}</span>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-danger hover:bg-red-50 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          workspace={currentWorkspace}
          documents={documents}
          onCreateDocument={handleCreateDocument}
          onSelectDocument={handleSelectDocument}
          selectedDocId={selectedDocument?._id}
          activeUsers={activeUsers}
        />

        {/* View Toggle for Mobile */}
        <div className="flex flex-col flex-1">
          <div className="md:hidden bg-white border-b border-border p-2 flex gap-2">
            <button
              onClick={() => setView('editor')}
              className={`flex-1 py-2 text-sm rounded ${
                view === 'editor' ? 'bg-primary text-white' : 'bg-gray-100 text-text'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setView('tasks')}
              className={`flex-1 py-2 text-sm rounded ${
                view === 'tasks' ? 'bg-primary text-white' : 'bg-gray-100 text-text'
              }`}
            >
              Tasks
            </button>
          </div>

          {/* Desktop: Split View, Mobile: Toggle View */}
          <div className="flex-1 flex overflow-hidden">
            <div
              className={`${
                view === 'split' || view === 'editor' ? 'flex' : 'hidden'
              } md:flex flex-1`}
            >
              <DocumentEditor
                document={selectedDocument}
                workspaceId={id}
                socket={socket}
                isOnline={isOnline}
                userId={user?.id}
                userName={user?.name}
              />
            </div>

            <div
              className={`${
                view === 'split' || view === 'tasks' ? 'flex' : 'hidden'
              } md:flex flex-1 border-l border-border`}
            >
              <KanbanBoard
                workspaceId={id}
                socket={socket}
                isOnline={isOnline}
                userId={user?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
