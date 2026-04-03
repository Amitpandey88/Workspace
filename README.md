# SyncSpace - Real-Time Collaboration Platform

A production-ready, real-time team collaboration web application built with the MERN stack featuring offline-first capabilities, collaborative document editing, and task management.

## Quick Start

```bash
cd syncspace

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# Start MongoDB
mongod

# Run the application
cd server && npm run dev  # Terminal 1
cd client && npm run dev  # Terminal 2
```

Visit http://localhost:3000

## Full Documentation

See the complete documentation in [syncspace/README.md](syncspace/README.md)

## Features

- Real-time collaborative document editing with cursor presence
- Kanban-style task board with drag-and-drop
- Offline-first with automatic sync when connection restored
- JWT authentication with HTTP-only cookies
- WebSocket-based live updates via Socket.io
- Service Worker caching for offline access
- IndexedDB offline storage
- Conflict detection and resolution
- Role-based access control

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Socket.io Client, Vite, React Beautiful DnD
- **Backend:** Node.js, Express.js, Socket.io, JWT, bcryptjs
- **Database:** MongoDB (Mongoose), IndexedDB (idb)
- **Real-time:** Socket.io WebSockets

## License

MIT