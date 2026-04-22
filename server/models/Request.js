const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  status: { type: String, enum: ['pending', 'dispatched'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);