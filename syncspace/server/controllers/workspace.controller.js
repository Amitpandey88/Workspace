const Workspace = require('../models/Workspace.model');
const User = require('../models/User.model');

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workspace name'
      });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = Workspace.generateInviteCode();
      const existing = await Workspace.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    // Create workspace
    const workspace = await Workspace.create({
      name,
      inviteCode,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    });

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id }
    });

    res.status(201).json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all workspaces for user
// @route   GET /api/workspaces
// @access  Private
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('members.user', 'name email')
      .populate('documents')
      .populate('tasks');

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Join workspace by invite code
// @route   POST /api/workspaces/join
// @access  Private
exports.joinWorkspace = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide invite code'
      });
    }

    const workspace = await Workspace.findOne({ inviteCode });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    // Check if already a member
    const isMember = workspace.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this workspace'
      });
    }

    // Add user to workspace
    workspace.members.push({
      user: req.user._id,
      role: 'editor'
    });
    await workspace.save();

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id }
    });

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get workspace details
// @route   GET /api/workspaces/:id
// @access  Private
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('documents')
      .populate('tasks')
      .populate('owner', 'name email');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Owner only)
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workspace'
      });
    }

    // Delete associated documents and tasks
    const Document = require('../models/Document.model');
    const Task = require('../models/Task.model');

    await Document.deleteMany({ workspace: workspace._id });
    await Task.deleteMany({ workspace: workspace._id });

    // Remove workspace from all members
    await User.updateMany(
      { workspaces: workspace._id },
      { $pull: { workspaces: workspace._id } }
    );

    await workspace.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
