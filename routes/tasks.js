// routes/tasks.js
const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
  addComment
} = require('../controllers/taskController');
const { auth, isProjectMember } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Task validation
const taskValidation = [
  body('title').notEmpty().withMessage('Task title is required')
];

// All routes protected
router.use(auth);

// Tasks for a project
router.route('/:projectId/tasks')
  .all(isProjectMember) // Check if user is member
  .get(getTasks)
  .post(taskValidation, createTask);

// Single task operations
router.route('/:projectId/tasks/:taskId')
  .all(isProjectMember)
  .put(taskValidation, updateTask)
  .delete(deleteTask);

// Update task position (drag & drop)
router.put('/:projectId/tasks/:taskId/position', isProjectMember, updateTaskPosition);

// Add comment to task
router.post('/:projectId/tasks/:taskId/comments', isProjectMember, addComment);

module.exports = router;
