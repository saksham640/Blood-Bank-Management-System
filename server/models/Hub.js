const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Model Town Central"
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['active', 'maintenance', 'offline'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hub', hubSchema);