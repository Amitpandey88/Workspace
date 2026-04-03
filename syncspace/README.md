# SyncSpace - Real-Time Collaboration Platform

![SyncSpace](https://img.shields.io/badge/SyncSpace-Production%20Ready-7C3AED)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-success)
![License](https://img.shields.io/badge/License-MIT-blue)

A production-ready, real-time team collaboration web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring offline-first capabilities, collaborative document editing, and task management.

## Features

### Real-Time Multi-User Collaboration
- Multiple users can edit documents simultaneously
- Live cursor presence showing each user's position
- Instant updates across all connected clients
- No page reload required

### Offline-First Functionality
- Full offline support with Service Workers
- Local data storage using IndexedDB
- Automatic sync when connection is restored
- Visual offline/online status indicators

### Automatic Saving & Smart Syncing
- Auto-save with 500ms debounce
- Zero data loss guarantee
- Conflict detection and resolution
- Version history tracking

### Unified Team Workspace
- Combined document editor and task board
- 6-character invite codes for easy sharing
- Role-based access control (Owner, Editor, Viewer)
- Real-time presence indicators

### Kanban Task Board
- Drag-and-drop task management
- Three status columns: To Do, In Progress, Done
- Real-time task updates
- Task assignment and due dates

## Tech Stack

**Frontend:**
- React.js 18 (Client-Side Rendering)
- Tailwind CSS for styling
- Socket.io Client for real-time communication
- Vite for build tooling
- React Beautiful DnD for drag-and-drop
- IndexedDB (via idb) for offline storage

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose ODM
- Socket.io for WebSocket connections
- JWT authentication with HTTP-only cookies
- bcryptjs for password hashing

**Real-Time:**
- Socket.io for bi-directional communication
- Room-based broadcasting per workspace
- Automatic reconnection handling

**Offline Support:**
- Service Workers for asset caching
- IndexedDB for data persistence
- Sync queue for pending operations

## Prerequisites

- Node.js v18 or higher
- MongoDB v4.4 or higher
- npm or yarn package manager
- Modern web browser with Service Worker support

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Amitpandey88/Workspace.git
cd Workspace/syncspace
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/syncspace
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux with systemd
sudo systemctl start mongod

# Or run directly
mongod --dbpath /path/to/data/directory
```

### 5. Run the application

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
├─────────────────────────────────────────────────────────────┤
│  React Components                                           │
│  ├── Auth Pages (Login, Signup)                            │
│  ├── Dashboard (Workspace List)                            │
│  ├── Workspace Page                                         │
│  │   ├── Document Editor (Real-time)                       │
│  │   ├── Kanban Board (Drag & Drop)                        │
│  │   └── Sidebar (Documents, Members)                      │
│  └── UI Components (Modals, Banners, etc.)                 │
│                                                              │
│  State Management                                           │
│  ├── AuthContext (User authentication)                     │
│  └── WorkspaceContext (Current workspace state)            │
│                                                              │
│  Custom Hooks                                               │
│  ├── useSocket (Socket.io connection)                      │
│  ├── useOffline (Online/offline detection)                 │
│  └── useDebounce (Input debouncing)                        │
│                                                              │
│  Offline Support                                            │
│  ├── Service Worker (Asset caching)                        │
│  └── IndexedDB (Local data storage)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER TIER                           │
├─────────────────────────────────────────────────────────────┤
│  Express.js API Server                                      │
│  ├── Auth Routes (/api/auth)                               │
│  ├── Workspace Routes (/api/workspaces)                    │
│  ├── Document Routes (/api/workspaces/:id/documents)       │
│  └── Task Routes (/api/workspaces/:id/tasks)               │
│                                                              │
│  Middleware                                                  │
│  ├── JWT Authentication                                     │
│  ├── Workspace Access Control                              │
│  └── Error Handler                                          │
│                                                              │
│  Socket.io Server                                           │
│  ├── Workspace Rooms                                        │
│  ├── Document Updates (document:edit)                      │
│  ├── Task Updates (task:update)                            │
│  ├── Cursor Updates (cursor:move)                          │
│  └── User Presence (user:joined, user:left)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE TIER                          │
├─────────────────────────────────────────────────────────────┤
│  MongoDB                                                     │
│  ├── Users Collection                                       │
│  ├── Workspaces Collection                                  │
│  ├── Documents Collection (with version history)           │
│  └── Tasks Collection                                       │
│                                                              │
│  IndexedDB (Client-side)                                    │
│  ├── pending_edits (Offline document edits)                │
│  ├── cached_docs (Offline document cache)                  │
│  └── pending_tasks (Offline task updates)                  │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Workspaces

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/workspaces` | Create workspace | Yes |
| GET | `/api/workspaces` | Get user's workspaces | Yes |
| POST | `/api/workspaces/join` | Join by invite code | Yes |
| GET | `/api/workspaces/:id` | Get workspace details | Yes |
| DELETE | `/api/workspaces/:id` | Delete workspace | Yes (Owner) |

### Documents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/workspaces/:id/documents` | Create document | Yes |
| GET | `/api/workspaces/:id/documents` | List documents | Yes |
| GET | `/api/workspaces/:id/documents/:docId` | Get document | Yes |
| PUT | `/api/workspaces/:id/documents/:docId` | Update document | Yes |
| DELETE | `/api/workspaces/:id/documents/:docId` | Delete document | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/workspaces/:id/tasks` | Create task | Yes |
| GET | `/api/workspaces/:id/tasks` | List tasks | Yes |
| PUT | `/api/workspaces/:id/tasks/:taskId` | Update task | Yes |
| DELETE | `/api/workspaces/:id/tasks/:taskId` | Delete task | Yes |

## Socket.io Events

### Client Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `join:workspace` | `{ workspaceId, userId, userName }` | Join workspace room |
| `leave:workspace` | `{ workspaceId }` | Leave workspace room |
| `document:edit` | `{ docId, content, userId, workspaceId }` | Send document edit |
| `task:update` | `{ taskId, status, workspaceId, userId }` | Send task update |
| `cursor:move` | `{ docId, position, userId, userName, workspaceId }` | Send cursor position |

### Server Broadcasts

| Event | Payload | Description |
|-------|---------|-------------|
| `workspace:users` | `[{ userId, userName }]` | Current active users |
| `user:joined` | `{ userId, name, socketId }` | User joined workspace |
| `user:left` | `{ userId, name, socketId }` | User left workspace |
| `document:updated` | `{ docId, content, editedBy, timestamp }` | Document updated |
| `task:updated` | `{ taskId, newStatus, updatedBy, timestamp }` | Task updated |
| `cursor:updated` | `{ userId, userName, position, docId, socketId }` | Cursor moved |

## Offline Sync Flow

```
┌─────────────┐
│   ONLINE    │
│  (Default)  │
└──────┬──────┘
       │
       │ Connection Lost
       ▼
┌─────────────┐
│  OFFLINE    │
│   MODE      │
└──────┬──────┘
       │
       │ 1. Edits saved to IndexedDB
       │ 2. Red offline banner shown
       │ 3. Changes queued for sync
       │
       │ Connection Restored
       ▼
┌─────────────┐
│  SYNCING    │
│   STATE     │
└──────┬──────┘
       │
       │ 1. Read pending_edits from IndexedDB
       │ 2. Send to server in timestamp order
       │ 3. Check for conflicts (< 2s delta)
       │ 4. Show ConflictModal if needed
       │ 5. Mark as synced on success
       │
       ▼
┌─────────────┐
│   ONLINE    │
│  (Synced)   │
└─────────────┘
```

## Database Schemas

### User Schema

```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  workspaces: [ObjectId ref Workspace],
  createdAt: Date
}
```

### Workspace Schema

```javascript
{
  name: String,
  inviteCode: String (6-char unique, indexed),
  owner: ObjectId ref User,
  members: [{
    user: ObjectId ref User,
    role: enum ['owner', 'editor', 'viewer']
  }],
  documents: [ObjectId ref Document],
  tasks: [ObjectId ref Task],
  createdAt: Date
}
```

### Document Schema

```javascript
{
  title: String,
  content: String,
  workspace: ObjectId ref Workspace,
  lastEditedBy: ObjectId ref User,
  version: Number,
  history: [{
    content: String,
    editedBy: ObjectId ref User,
    timestamp: Date
  }],
  updatedAt: Date
}
```

### Task Schema

```javascript
{
  title: String,
  description: String,
  status: enum ['todo', 'in-progress', 'done'],
  assignee: ObjectId ref User,
  workspace: ObjectId ref Workspace,
  createdBy: ObjectId ref User,
  dueDate: Date,
  createdAt: Date
}
```

## IndexedDB Structure

**Database Name:** `syncspace-offline`

**Object Stores:**

1. **pending_edits**
   - keyPath: `id` (auto-increment)
   - Indexes: `synced`, `timestamp`
   - Schema: `{ id, docId, content, workspaceId, timestamp, synced }`

2. **cached_docs**
   - keyPath: `docId`
   - Indexes: `cachedAt`
   - Schema: `{ docId, content, title, cachedAt }`

3. **pending_tasks**
   - keyPath: `id` (auto-increment)
   - Indexes: `synced`, `timestamp`
   - Schema: `{ id, taskId, status, workspaceId, timestamp, synced }`

## Conflict Resolution

When two users edit the same document offline and both reconnect:

1. **Time Delta < 2 seconds:** Show ConflictModal
   - Display both versions side-by-side
   - User manually selects which version to keep
   - Rejected version discarded

2. **Time Delta ≥ 2 seconds:** Last-Write-Wins
   - Automatically apply the most recent edit
   - No user intervention required

## Security Features

- JWT tokens stored in HTTP-only cookies (XSS protection)
- Passwords hashed with bcryptjs (12 rounds)
- CORS configured for specific origin
- Workspace access control middleware
- Role-based permissions (Owner, Editor, Viewer)
- Input validation on all endpoints

## Performance Optimizations

- 500ms debounce on document edits
- Socket.io rooms for scoped broadcasts
- IndexedDB for efficient offline storage
- Service Worker caching for static assets
- Automatic reconnection with exponential backoff
- Version history limited to last 50 edits

## Known Limitations

1. **Rich Text Editing:** Current implementation uses plain textarea. Future versions could integrate a WYSIWYG editor like Quill or Slate.

2. **File Attachments:** Not currently supported. Could be added with file upload to cloud storage (S3, Cloudinary).

3. **Mobile App:** Currently web-only. Could be wrapped with React Native or Capacitor for native mobile apps.

4. **Real-time Cursor Sync:** Cursor positions shown but not pixel-perfect. Could be improved with operational transformation.

5. **Video/Audio Chat:** Not included. Could integrate WebRTC for voice/video calls.

## Future Roadmap

- [ ] Rich text editing with formatting toolbar
- [ ] File attachments and image uploads
- [ ] @mentions and notifications
- [ ] Search functionality across documents
- [ ] Export documents (PDF, Markdown, DOCX)
- [ ] Mobile native apps
- [ ] Video conferencing integration
- [ ] Advanced permissions and team roles
- [ ] Activity logs and audit trail
- [ ] Custom themes and branding

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with the MERN stack
- Real-time functionality powered by Socket.io
- UI components styled with Tailwind CSS
- Offline support via Service Workers and IndexedDB

---

**Built with ❤️ by the SyncSpace Team**
