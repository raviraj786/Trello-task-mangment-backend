// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');



const auth = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); 
    if (!user) return res.status(401).json({ message: "Invalid Token" });
    
    req.user = user; 
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};







const isProjectMember = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const projectId = req.params.projectId || req.params.id || req.params.project_id;
    if (!projectId) return res.status(400).json({ success: false, message: 'Project id missing' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const userIdStr = String(req.user._id);
    const isMember = Array.isArray(project.members) && project.members.some(m => String(m) === userIdStr);

    if (!isMember) return res.status(403).json({ success: false, message: 'Not a project member' });

    next();
  } catch (err) {
    console.error('isProjectMember error:', err);
    return res.status(500).json({ success: false, message: 'Server error checking project membership' });
  }
};

module.exports = { auth, isProjectMember };
