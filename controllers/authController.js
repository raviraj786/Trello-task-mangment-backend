const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_EXPIRE_DEFAULT = '30d';

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRE_DEFAULT,
    });

    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json({ success: true, user: userData, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "User does not exist" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ success: false, message: "Password is incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE_DEFAULT });

    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ success: true, message: "Login successful", user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get logged-in user
exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const safeUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar || ''
    };
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
