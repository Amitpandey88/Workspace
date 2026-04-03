import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import api from '../../utils/api';
import { savePendingTask } from '../../utils/indexedDB';

const KanbanBoard = ({ workspaceId, socket, isOnline, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  useEffect(() => {
    if (workspaceId) {
      fetchTasks();
    }
  }, [workspaceId]);

  // Listen for real-time task updates
  useEffect(() => {
    if (!socket) return;

    socket.on('task:updated', (data) => {
      if (data.updatedBy !== userId) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === data.taskId ? { ...task, status: data.newStatus } : task
          )
        );
      }
    });

    return () => {
      socket.off('task:updated');
    };
  }, [socket, userId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/tasks`);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      const response = await api.post(`/workspaces/${workspaceId}/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription,
        status: 'todo'
      });

      if (response.data.success) {
        setTasks([...tasks, response.data.task]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setShowCreateTask(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    // Update on server or save to IndexedDB
    if (isOnline) {
      try {
        await api.put(`/workspaces/${workspaceId}/tasks/${draggableId}`, {
          status: newStatus
        });

        // Emit socket event
        if (socket) {
          socket.emit('task:update', {
            taskId: draggableId,
            status: newStatus,
            workspaceId,
            userId
          });
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        fetchTasks(); // Revert on error
      }
    } else {
      await savePendingTask(draggableId, newStatus, workspaceId);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const columns = [
    { id: 'todo', title: 'To Do', tasks: getTasksByStatus('todo') },
    { id: 'in-progress', title: 'In Progress', tasks: getTasksByStatus('in-progress') },
    { id: 'done', title: 'Done', tasks: getTasksByStatus('done') }
  ];

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Task Board</h2>
        <button
          onClick={() => setShowCreateTask(!showCreateTask)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-purple-700"
        >
          New Task
        </button>
      </div>

      {showCreateTask && (
        <form onSubmit={handleCreateTask} className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="mb-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-primary focus:border-primary"
              autoFocus
            />
          </div>
          <div className="mb-3">
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-primary focus:border-primary resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-purple-700"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-text mb-4 flex items-center justify-between">
                <span>{column.title}</span>
                <span className="text-sm font-normal text-gray-500">
                  {column.tasks.length}
                </span>
              </h3>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-purple-50' : ''
                    } transition-colors rounded-lg`}
                  >
                    {column.tasks.map((task, index) => (
                      <TaskCard key={task._id} task={task} index={index} />
                    ))}
                    {provided.placeholder}

                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
