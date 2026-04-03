const Document = require('../models/Document.model');
const Workspace = require('../models/Workspace.model');

// @desc    Create document
// @route   POST /api/workspaces/:id/documents
// @access  Private
exports.createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document title'
      });
    }

    const document = await Document.create({
      title,
      content: content || '',
      workspace: req.params.id,
      lastEditedBy: req.user._id,
      history: [{
        content: content || '',
        editedBy: req.user._id,
        timestamp: Date.now()
      }]
    });

    // Add document to workspace
    await Workspace.findByIdAndUpdate(req.params.id, {
      $push: { documents: document._id }
    });

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all documents in workspace
// @route   GET /api/workspaces/:id/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ workspace: req.params.id })
      .populate('lastEditedBy', 'name email')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single document
// @route   GET /api/workspaces/:id/documents/:docId
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.docId,
      workspace: req.params.id
    }).populate('lastEditedBy', 'name email')
      .populate('history.editedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update document
// @route   PUT /api/workspaces/:id/documents/:docId
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    const { content, title } = req.body;

    const document = await Document.findOne({
      _id: req.params.docId,
      workspace: req.params.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document
    if (title) document.title = title;
    if (content !== undefined) {
      document.content = content;
      document.version += 1;
      document.lastEditedBy = req.user._id;

      // Add to history (keep last 50 versions)
      document.history.push({
        content,
        editedBy: req.user._id,
        timestamp: Date.now()
      });

      if (document.history.length > 50) {
        document.history = document.history.slice(-50);
      }
    }

    await document.save();

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/workspaces/:id/documents/:docId
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.docId,
      workspace: req.params.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.deleteOne();

    // Remove from workspace
    await Workspace.findByIdAndUpdate(req.params.id, {
      $pull: { documents: document._id }
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
