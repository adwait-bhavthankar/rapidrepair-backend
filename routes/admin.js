const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Booking = require('../models/Booking');

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admin only' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { id: 'admin_user_id', username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );
    return res.json({ 
      token, 
      user: { id: 'admin_user_id', username: 'admin', role: 'admin', email: 'admin@quickfix.com' } 
    });
  } else {
    return res.status(400).json({ msg: 'Invalid admin credentials' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (and associated data)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete worker profile if user is a worker
    await WorkerProfile.deleteOne({ user: userId });
    
    // Delete bookings where this user is customer or worker
    await Booking.deleteMany({
      $or: [
        { customer: userId },
        { worker: userId }
      ]
    });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.json({ msg: 'User and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all workers (profiles)
router.get('/workers', adminAuth, async (req, res) => {
  try {
    const workers = await WorkerProfile.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete worker profile only
router.delete('/workers/:id', adminAuth, async (req, res) => {
  try {
    const profileId = req.params.id;
    const profile = await WorkerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ msg: 'Worker profile not found' });
    
    // Delete profile
    await WorkerProfile.findByIdAndDelete(profileId);
    
    res.json({ msg: 'Worker profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions (bookings)
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'username email')
      .populate('worker', 'username email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
router.delete('/bookings/:id', adminAuth, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
