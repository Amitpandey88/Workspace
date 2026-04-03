import api from './api';
import {
  getPendingEdits,
  getPendingTasks,
  markEditSynced,
  markTaskSynced,
  deletePendingEdit,
  deletePendingTask
} from './indexedDB';

export const syncPendingChanges = async (socket) => {
  try {
    // Sync pending edits
    const pendingEdits = await getPendingEdits();

    for (const edit of pendingEdits) {
      try {
        await api.put(
          `/workspaces/${edit.workspaceId}/documents/${edit.docId}`,
          { content: edit.content }
        );

        // Emit via socket
        if (socket) {
          socket.emit('document:edit', {
            docId: edit.docId,
            content: edit.content,
            workspaceId: edit.workspaceId
          });
        }

        await deletePendingEdit(edit.id);
      } catch (error) {
        console.error('Failed to sync edit:', error);
      }
    }

    // Sync pending tasks
    const pendingTasks = await getPendingTasks();

    for (const task of pendingTasks) {
      try {
        await api.put(
          `/workspaces/${task.workspaceId}/tasks/${task.taskId}`,
          { status: task.status }
        );

        // Emit via socket
        if (socket) {
          socket.emit('task:update', {
            taskId: task.taskId,
            status: task.status,
            workspaceId: task.workspaceId
          });
        }

        await deletePendingTask(task.id);
      } catch (error) {
        console.error('Failed to sync task:', error);
      }
    }

    console.log('Offline changes synced successfully');
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

export const checkForConflicts = (localEdit, serverEdit) => {
  const timeDelta = Math.abs(localEdit.timestamp - serverEdit.timestamp);

  // If edits happened within 2 seconds, show conflict modal
  if (timeDelta < 2000) {
    return true;
  }

  // Otherwise use Last-Write-Wins
  return false;
};
