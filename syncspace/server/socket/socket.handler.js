const setupSocket = (io) => {
  // Store active users per workspace
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join workspace room
    socket.on('join:workspace', ({ workspaceId, userId, userName }) => {
      socket.join(workspaceId);

      // Track active user
      if (!activeUsers.has(workspaceId)) {
        activeUsers.set(workspaceId, new Map());
      }
      activeUsers.get(workspaceId).set(socket.id, { userId, userName });

      // Notify others
      socket.to(workspaceId).emit('user:joined', {
        userId,
        name: userName,
        socketId: socket.id
      });

      // Send current active users to the new user
      const workspaceUsers = Array.from(activeUsers.get(workspaceId).values());
      socket.emit('workspace:users', workspaceUsers);

      console.log(`User ${userName} joined workspace ${workspaceId}`);
    });

    // Document edit event
    socket.on('document:edit', ({ docId, content, userId, workspaceId }) => {
      socket.to(workspaceId).emit('document:updated', {
        docId,
        content,
        editedBy: userId,
        timestamp: Date.now()
      });
    });

    // Task update event
    socket.on('task:update', ({ taskId, status, workspaceId, userId }) => {
      socket.to(workspaceId).emit('task:updated', {
        taskId,
        newStatus: status,
        updatedBy: userId,
        timestamp: Date.now()
      });
    });

    // Cursor movement event
    socket.on('cursor:move', ({ docId, position, userId, userName, workspaceId }) => {
      socket.to(workspaceId).emit('cursor:updated', {
        userId,
        userName,
        position,
        docId,
        socketId: socket.id
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Find and remove user from active users
      activeUsers.forEach((users, workspaceId) => {
        const user = users.get(socket.id);
        if (user) {
          users.delete(socket.id);

          // Notify others
          io.to(workspaceId).emit('user:left', {
            userId: user.userId,
            name: user.userName,
            socketId: socket.id
          });

          // Clean up empty workspace
          if (users.size === 0) {
            activeUsers.delete(workspaceId);
          }
        }
      });
    });

    // Leave workspace
    socket.on('leave:workspace', ({ workspaceId }) => {
      socket.leave(workspaceId);

      const users = activeUsers.get(workspaceId);
      if (users) {
        const user = users.get(socket.id);
        if (user) {
          users.delete(socket.id);

          socket.to(workspaceId).emit('user:left', {
            userId: user.userId,
            name: user.userName,
            socketId: socket.id
          });
        }
      }
    });
  });

  return io;
};

module.exports = setupSocket;
