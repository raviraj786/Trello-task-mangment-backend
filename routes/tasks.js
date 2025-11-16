// routes/tasks.js
const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
  addComment,
  bulkUpdateTasks,
} = require("../controllers/taskController");
const { auth, isProjectMember } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

const taskValidation = [
  body("title").notEmpty().withMessage("Task title is required"),
];

router.use(auth);

router
  .route("/:projectId/tasks")
  .all(isProjectMember)
  .get(getTasks)
  .post(taskValidation, createTask);

router
  .route("/:projectId/tasks/:taskId")
  .all(isProjectMember)
  .put(taskValidation, updateTask)
  .delete(deleteTask);

router.patch(
  "/:projectId/tasks/:taskId/position",
  isProjectMember,
  updateTaskPosition
);

router.post("/:projectId/tasks/bulk", isProjectMember, bulkUpdateTasks);

router.post("/:projectId/tasks/:taskId/comments", isProjectMember, addComment);

module.exports = router;
