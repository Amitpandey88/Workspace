const Task = require('../models/Task.model');
const Workspace = require('../models/Workspace.model');

// @desc    Create task
// @route   POST /api/workspaces/:id/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assignee, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title'
      });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      assignee,
      workspace: req.params.id,
      createdBy: req.user._id,
      dueDate
    });

    // Add task to workspace
    await Workspace.findByIdAndUpdate(req.params.id, {
      $push: { tasks: task._id }
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tasks in workspace
// @route   GET /api/workspaces/:id/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ workspace: req.params.id })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/workspaces/:id/tasks/:taskId
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignee, dueDate } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      workspace: req.params.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/workspaces/:id/tasks/:taskId
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      workspace: req.params.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.deleteOne();

    // Remove from workspace
    await Workspace.findByIdAndUpdate(req.params.id, {
      $pull: { tasks: task._id }
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
