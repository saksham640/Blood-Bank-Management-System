
// First we will run "npm install to installl all the dependencies"
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- MODELS ---
const Inventory = require('./models/Inventory');
const Appointment = require('./models/Appointment');
const Request = require('./models/Request');
const User = require('./models/User'); 
const Hub = require('./models/Hub');

const app = express();

// --- UTILITY: HAVERSINE FORMULA here  ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
};

// Middleware
app.use(express.json());
app.use(cors());

// --- 1. NETWORK HUB ROUTES ---
app.post('/api/hubs/create', async (req, res) => {
  try {
    const newHub = new Hub(req.body);
    await newHub.save();
    res.status(201).json({ success: true, message: "Network Hub Established." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/hubs', async (req, res) => {
  try {
    const hubs = await Hub.find().sort({ createdAt: -1 });
    res.json(hubs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch network hubs" });
  }
});

// --- 2. AUTH ROUTES ---
app.post('/api/auth/register', require('./controllers/authController').registerController);
app.post('/api/auth/login', require('./controllers/authController').loginController);

app.get('/api/auth/me/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. INVENTORY ROUTES ---
app.post('/api/inventory/add', async (req, res) => {
  try {
    const newUnit = new Inventory(req.body);
    await newUnit.save();
    res.status(201).json({ success: true, message: "Unit added to Atlas!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const stock = await Inventory.find().sort({ createdAt: -1 }).populate('hubId');
    res.status(200).json(stock);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

app.get('/api/inventory/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const history = await Inventory.find({ donorName: user.name }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donor history" });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Unit purged from registry." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 4. APPOINTMENT & PROMOTE ---
app.post('/api/appointments/book', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json({ success: true, message: "Appointment Locked In!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

app.post('/api/inventory/promote', async (req, res) => {
  try {
    const { appointmentId, userId, donorName, bloodGroup, volume, hubId } = req.body;
    if (!userId || !appointmentId || !hubId) return res.status(400).json({ message: "Missing required IDs" });

    const unitId = `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newUnit = new Inventory({
      unitId, bloodGroup, collectionDate: new Date(),
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      status: 'available', donorName, donorId: userId, hubId
    });
    await newUnit.save();

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    await User.findByIdAndUpdate(userId, { 
      $inc: { donationsCount: 1, totalVolume: Number(volume) || 450 },
      $set: { lastDonationDate: new Date() }
    }, { runValidators: false });

    res.status(201).json({ success: true, message: "Unit Promoted to Hub" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 5. HOSPITAL REQUEST ROUTES (Isolated Dashboards) ---
app.post('/api/requests/create', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ success: true, message: "Request Broadcasted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// THE FIX: Fetching only for a specific hospital
app.get('/api/requests/hospital/:hospitalName', async (req, res) => {
  try {
    const requests = await Request.find({ hospitalName: req.params.hospitalName }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your requisitions" });
  }
});

// Admin view (sees all pending)
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// Smart Match Engine
app.get('/api/requests/match/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const availableUnits = await Inventory.find({ 
      bloodGroup: request.bloodGroup, status: 'available' 
    }).populate('hubId');

    const rankedMatches = availableUnits.map(unit => {
      if (!unit.hubId || !unit.hubId.location) return null;
      const distance = calculateDistance(
        request.location.lat, request.location.lng,
        unit.hubId.location.lat, unit.hubId.location.lng
      );
      return {
        ...unit._doc,
        distance: Number(distance.toFixed(2)),
        estimatedTime: Math.round(distance * 4 + 10) 
      };
    }).filter(u => u !== null).sort((a, b) => a.distance - b.distance); 

    res.json(rankedMatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/requests/resolve/:requestId/:inventoryId', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.inventoryId);
    await Request.findByIdAndDelete(req.params.requestId);
    res.json({ success: true, message: "Blood Dispatched" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Request Aborted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add this to your server.js
app.get('/api/admin/donors', async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' }).sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donor registry" });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User account terminated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ DB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));