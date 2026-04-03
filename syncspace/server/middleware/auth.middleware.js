const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

// Check workspace access
exports.checkWorkspaceAccess = async (req, res, next) => {
  try {
    const Workspace = require('../models/Workspace.model');
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is member or owner
    const isMember = workspace.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workspace'
      });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking workspace access'
    });
  }
};
