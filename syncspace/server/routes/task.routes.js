const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');
const { protect, checkWorkspaceAccess } = require('../middleware/auth.middleware');

router.post('/', protect, checkWorkspaceAccess, createTask);
router.get('/', protect, checkWorkspaceAccess, getTasks);
router.put('/:taskId', protect, checkWorkspaceAccess, updateTask);
router.delete('/:taskId', protect, checkWorkspaceAccess, deleteTask);

module.exports = router;
