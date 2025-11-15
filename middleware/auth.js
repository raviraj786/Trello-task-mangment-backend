const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const isProjectMember = async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const isMember = project.members.includes(userId);
  if (!isMember) return res.status(403).json({ message: 'Not a project member' });

  next();
};

module.exports = { auth, isProjectMember }; // ✅ must be object with function properties
