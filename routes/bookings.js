const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');

router.post('/', auth, async (req, res) => {
  try {
    const { workerId, service, bookingDate } = req.body;
    
    const workerProfile = await WorkerProfile.findById(workerId);
    if (!workerProfile) {
      return res.status(400).json({ msg: 'Worker not found' });
    }

    const booking = new Booking({
      customer: req.user.id,
      worker: workerProfile.user,
      service,
      bookingDate
    });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customer', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('worker', 'username')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/worker', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ worker: req.user.id })
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
