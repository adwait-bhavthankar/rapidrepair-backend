const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceCategory: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  description: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
