import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { cacheDocument, savePendingEdit } from '../../utils/indexedDB';
import CursorPresence from './CursorPresence';
import api from '../../utils/api';

const DocumentEditor = ({ document, workspaceId, socket, isOnline, userId, userName }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [cursors, setCursors] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  const debouncedContent = useDebounce(content, 500);

  useEffect(() => {
    if (document) {
      setContent(document.content || '');
      setTitle(document.title || '');
      setLastSaved(document.updatedAt);

      // Cache document for offline access
      cacheDocument(document._id, document.content, document.title);
    }
  }, [document]);

  // Save content when debounced value changes
  useEffect(() => {
    if (document && debouncedContent !== document.content) {
      saveContent(debouncedContent);
    }
  }, [debouncedContent]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !document) return;

    socket.on('document:updated', (data) => {
      if (data.docId === document._id && data.editedBy !== userId) {
        setContent(data.content);
        setLastSaved(data.timestamp);
      }
    });

    socket.on('cursor:updated', (data) => {
      if (data.docId === document._id && data.userId !== userId) {
        setCursors((prev) => {
          const filtered = prev.filter((c) => c.socketId !== data.socketId);
          return [...filtered, data];
        });

        // Remove cursor after 3 seconds of inactivity
        setTimeout(() => {
          setCursors((prev) => prev.filter((c) => c.socketId !== data.socketId));
        }, 3000);
      }
    });

    return () => {
      socket.off('document:updated');
      socket.off('cursor:updated');
    };
  }, [socket, document, userId]);

  const saveContent = async (newContent) => {
    if (!document) return;

    if (isOnline) {
      try {
        await api.put(`/workspaces/${workspaceId}/documents/${document._id}`, {
          content: newContent
        });

        // Emit socket event for real-time sync
        if (socket) {
          socket.emit('document:edit', {
            docId: document._id,
            content: newContent,
            userId,
            workspaceId
          });
        }

        setLastSaved(Date.now());
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    } else {
      // Save to IndexedDB for offline sync
      await savePendingEdit(document._id, newContent, workspaceId);
      setLastSaved(Date.now());
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);

    // Emit cursor position
    if (socket && document) {
      const textarea = e.target;
      const position = {
        top: textarea.scrollTop,
        left: textarea.selectionStart
      };

      socket.emit('cursor:move', {
        docId: document._id,
        position,
        userId,
        userName,
        workspaceId
      });
    }
  };

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a document to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>
            {isOnline ? '🟢 Auto-saving...' : '🔴 Offline - Changes saved locally'}
          </span>
          {lastSaved && (
            <span>
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <CursorPresence cursors={cursors} />
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          className="w-full h-full p-6 resize-none focus:outline-none text-text"
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
