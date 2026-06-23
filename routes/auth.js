const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    if (role === 'worker') {
      await WorkerProfile.create({ 
        user: user._id, 
        serviceCategory: 'General',
        experienceYears: 0,
        description: '',
        verified: process.env.AUTO_VERIFY_WORKERS === 'true'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, username, email, role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role === 'admin') {
      return res.json({ _id: 'admin_user_id', username: 'admin', role: 'admin', email: 'admin@quickfix.com' });
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
