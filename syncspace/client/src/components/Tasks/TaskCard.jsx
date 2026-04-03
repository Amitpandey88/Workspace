import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const TaskCard = ({ task, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'border-l-4 border-l-gray-400';
      case 'in-progress':
        return 'border-l-4 border-l-blue-500';
      case 'done':
        return 'border-l-4 border-l-success';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-3 ${getStatusColor(
            task.status
          )} ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'all 0.2s ease'
          }}
        >
          <h4 className="font-medium text-text mb-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            {task.assignee && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  {task.assignee.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600">{task.assignee.name}</span>
              </div>
            )}

            {task.dueDate && (
              <span className="text-xs text-gray-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
