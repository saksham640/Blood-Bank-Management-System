const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['donor', 'admin', 'hospital'] 
  },
  
  // 1. PHYSICAL ADDRESS (String)
  address: { type: String, required: true },

  // 2. GEOSPATIAL COORDINATES (For Map & Distance Math)
  coords: {
    lat: { 
      type: Number, 
      required: function() { return this.role === 'hospital'; } 
    },
    lng: { 
      type: Number, 
      required: function() { return this.role === 'hospital'; } 
    }
  },

  // Conditional Data
  bloodGroup: { 
    type: String, 
    required: function() { return this.role === 'donor'; } 
  },
  licenseId: { 
    type: String, 
    required: function() { return this.role === 'hospital'; } 
  },

  createdAt: { type: Date, default: Date.now },
  
  // STATS SECTION
  donationsCount: { type: Number, default: 0, min: 0 },
  totalVolume: { type: Number, default: 0, min: 0 },
  lastDonationDate: { type: Date }  
});

module.exports = mongoose.model('User', userSchema);