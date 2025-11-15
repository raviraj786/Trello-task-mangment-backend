const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title').notEmpty().withMessage('Project title is required')
];

// Apply auth middleware to all routes
router.use(auth);

router.route('/')
  .get(getProjects)
  .post(projectValidation, createProject);

router.route('/:id')
  .put(projectValidation, updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);

module.exports = router;