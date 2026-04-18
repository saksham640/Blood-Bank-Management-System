const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodGroup: { 
    type: String, 
    required: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] 
  },
  unitId: { type: String, required: true, unique: true }, // The barcode
  collectionDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { 
    type: String, 
    default: 'available', 
    enum: ['available', 'requested', 'dispatched', 'testing'] 
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tracking which admin added it
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);