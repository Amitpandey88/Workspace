import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { workspaces, setWorkspaces, setCurrentWorkspace } = useWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      if (response.data.success) {
        setWorkspaces(response.data.workspaces);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/workspaces', { name: workspaceName });
      if (response.data.success) {
        setWorkspaces([...workspaces, response.data.workspace]);
        setShowCreateModal(false);
        setWorkspaceName('');
        navigate(`/workspace/${response.data.workspace._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/workspaces/join', { inviteCode });
      if (response.data.success) {
        setWorkspaces([...workspaces, response.data.workspace]);
        setShowJoinModal(false);
        setInviteCode('');
        navigate(`/workspace/${response.data.workspace._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join workspace');
    } finally {
      setLoading(false);
    }
  };

  const openWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">SyncSpace</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text">Welcome, {user?.name}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text">Your Workspaces</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50"
            >
              Join Workspace
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-purple-700"
            >
              Create Workspace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              onClick={() => openWorkspace(workspace)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer border border-border transition-shadow"
            >
              <h3 className="text-xl font-semibold text-text mb-2">
                {workspace.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {workspace.members?.length || 0} members
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{workspace.documents?.length || 0} documents</span>
                <span>{workspace.tasks?.length || 0} tasks</span>
              </div>
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No workspaces yet. Create one to get started!
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-text mb-4">Create New Workspace</h3>
            {error && (
              <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter workspace name"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setWorkspaceName('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-text mb-4">Join Workspace</h3>
            {error && (
              <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleJoinWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-primary focus:border-primary uppercase"
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setError('');
                    setInviteCode('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
