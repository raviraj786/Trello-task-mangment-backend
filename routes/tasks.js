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

// Validation rules
const taskValidation = [
  body('title').notEmpty().withMessage('Task title is required')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes for tasks
// Note: do NOT use router.use('/:projectId/tasks', isProjectMember)
// Instead, apply middleware per route using .all() or as last argument

router.route('/:projectId/tasks')
  .all(isProjectMember) // middleware applied to all methods on this route
  .get(getTasks)
  .post(taskValidation, createTask);

router.route('/:projectId/tasks/:taskId')
  .all(isProjectMember)
  .put(taskValidation, updateTask)
  .delete(deleteTask);

router.put('/:projectId/tasks/:taskId/position', isProjectMember, updateTaskPosition);
router.post('/:projectId/tasks/:taskId/comments', isProjectMember, addComment);

module.exports = router;
