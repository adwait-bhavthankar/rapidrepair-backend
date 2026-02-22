const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkerProfile = require('../models/WorkerProfile');

router.get('/', async (req, res) => {
  try {
    const { verified } = req.query;
    const filter = verified === 'true' ? { verified: true } : {};
    const workers = await WorkerProfile.find(filter)
      .populate('user', 'username email');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { serviceCategory, experienceYears, description, location } = req.body;
    let profile = await WorkerProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = new WorkerProfile({ user: req.user.id });
    }
    
    profile.serviceCategory = serviceCategory || profile.serviceCategory;
    profile.experienceYears = experienceYears || profile.experienceYears;
    profile.description = description || profile.description;
    
    if (location) {
      profile.location = {
        lat: location.lat,
        lng: location.lng,
        address: location.address || ''
      };
    }
    
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/verify', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }
    const profile = await WorkerProfile.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    ).populate('user', 'username email');
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
