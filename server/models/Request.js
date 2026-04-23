const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  // THE CRITICAL ADDITION:
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  urgency: { type: String, enum: ['Routine', 'High', 'Critical'], default: 'Routine' },
  status: { type: String, enum: ['pending', 'dispatched'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);