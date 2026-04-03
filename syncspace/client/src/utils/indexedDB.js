import { openDB } from 'idb';

const DB_NAME = 'syncspace-offline';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for pending edits
      if (!db.objectStoreNames.contains('pending_edits')) {
        const editStore = db.createObjectStore('pending_edits', {
          keyPath: 'id',
          autoIncrement: true
        });
        editStore.createIndex('synced', 'synced');
        editStore.createIndex('timestamp', 'timestamp');
      }

      // Store for cached documents
      if (!db.objectStoreNames.contains('cached_docs')) {
        const docStore = db.createObjectStore('cached_docs', {
          keyPath: 'docId'
        });
        docStore.createIndex('cachedAt', 'cachedAt');
      }

      // Store for pending tasks
      if (!db.objectStoreNames.contains('pending_tasks')) {
        const taskStore = db.createObjectStore('pending_tasks', {
          keyPath: 'id',
          autoIncrement: true
        });
        taskStore.createIndex('synced', 'synced');
        taskStore.createIndex('timestamp', 'timestamp');
      }
    }
  });
};

// Pending Edits Operations
export const savePendingEdit = async (docId, content, workspaceId) => {
  const db = await initDB();
  return await db.add('pending_edits', {
    docId,
    content,
    workspaceId,
    timestamp: Date.now(),
    synced: false
  });
};

export const getPendingEdits = async () => {
  const db = await initDB();
  const tx = db.transaction('pending_edits', 'readonly');
  const index = tx.store.index('synced');
  return await index.getAll(false);
};

export const markEditSynced = async (id) => {
  const db = await initDB();
  const tx = db.transaction('pending_edits', 'readwrite');
  const edit = await tx.store.get(id);
  if (edit) {
    edit.synced = true;
    await tx.store.put(edit);
  }
  await tx.done;
};

export const deletePendingEdit = async (id) => {
  const db = await initDB();
  return await db.delete('pending_edits', id);
};

// Cached Documents Operations
export const cacheDocument = async (docId, content, title) => {
  const db = await initDB();
  return await db.put('cached_docs', {
    docId,
    content,
    title,
    cachedAt: Date.now()
  });
};

export const getCachedDocument = async (docId) => {
  const db = await initDB();
  return await db.get('cached_docs', docId);
};

export const getAllCachedDocuments = async () => {
  const db = await initDB();
  return await db.getAll('cached_docs');
};

export const deleteCachedDocument = async (docId) => {
  const db = await initDB();
  return await db.delete('cached_docs', docId);
};

// Pending Tasks Operations
export const savePendingTask = async (taskId, status, workspaceId) => {
  const db = await initDB();
  return await db.add('pending_tasks', {
    taskId,
    status,
    workspaceId,
    timestamp: Date.now(),
    synced: false
  });
};

export const getPendingTasks = async () => {
  const db = await initDB();
  const tx = db.transaction('pending_tasks', 'readonly');
  const index = tx.store.index('synced');
  return await index.getAll(false);
};

export const markTaskSynced = async (id) => {
  const db = await initDB();
  const tx = db.transaction('pending_tasks', 'readwrite');
  const task = await tx.store.get(id);
  if (task) {
    task.synced = true;
    await tx.store.put(task);
  }
  await tx.done;
};

export const deletePendingTask = async (id) => {
  const db = await initDB();
  return await db.delete('pending_tasks', id);
};

// Clear all offline data
export const clearOfflineData = async () => {
  const db = await initDB();
  const tx = db.transaction(['pending_edits', 'cached_docs', 'pending_tasks'], 'readwrite');
  await Promise.all([
    tx.objectStore('pending_edits').clear(),
    tx.objectStore('cached_docs').clear(),
    tx.objectStore('pending_tasks').clear()
  ]);
  await tx.done;
};
