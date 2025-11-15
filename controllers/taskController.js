const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    // Group tasks by status for Kanban board
    const groupedTasks = {
      todo: tasks.filter(task => task.status === 'todo'),
      inprogress: tasks.filter(task => task.status === 'inprogress'),
      done: tasks.filter(task => task.status === 'done')
    };

    res.json({
      success: true,
      data: groupedTasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
};

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, assignee, dueDate, status } = req.body;

    // Get highest position for the status
    const highestPositionTask = await Task.findOne({ 
      project: req.params.projectId, 
      status: status || 'todo' 
    }).sort({ position: -1 });

    const position = highestPositionTask ? highestPositionTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignee,
      dueDate,
      status: status || 'todo',
      position
    });

    await task.populate('assignee', 'name email avatar');

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:taskId
// @access  Private
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignee', 'name email avatar')
     .populate('comments.user', 'name email avatar');

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/projects/:projectId/tasks/:taskId
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
};

// @desc    Update task position (drag and drop)
// @route   PUT /api/projects/:projectId/tasks/:taskId/position
// @access  Private
const updateTaskPosition = async (req, res) => {
  try {
    const { status, position } = req.body;
    
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task status and position
    task.status = status;
    task.position = position;
    await task.save();

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task position error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task position'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/projects/:projectId/tasks/:taskId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.json({
      success: true,
      data: task.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
  addComment
};