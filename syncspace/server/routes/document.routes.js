const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/document.controller');
const { protect, checkWorkspaceAccess } = require('../middleware/auth.middleware');

router.post('/', protect, checkWorkspaceAccess, createDocument);
router.get('/', protect, checkWorkspaceAccess, getDocuments);
router.get('/:docId', protect, checkWorkspaceAccess, getDocument);
router.put('/:docId', protect, checkWorkspaceAccess, updateDocument);
router.delete('/:docId', protect, checkWorkspaceAccess, deleteDocument);

module.exports = router;
