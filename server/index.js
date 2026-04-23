const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- MODELS (Grouped together so the server knows they exist) ---
const Inventory = require('./models/Inventory');
const Appointment = require('./models/Appointment');
const Request = require('./models/Request');
const User = require('./models/User'); // <--- THE MISSING LINK THAT CAUSED THE 500 ERROR
const Hub = require('./models/Hub');
const app = express();

//utility function
// Calculate distance between two points in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d; // Distance in km
};

// Middleware
app.use(express.json());
app.use(cors());
// --- 5. NETWORK HUB ROUTES ---
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
// --- 1. AUTH ROUTES ---
app.post('/api/auth/register', require('./controllers/authController').registerController);
app.post('/api/auth/login', require('./controllers/authController').loginController);

// GET: Fetch fresh user data (for Syncing Stats on Donor Dash)
app.get('/api/auth/me/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// --- 2. INVENTORY ROUTES ---
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
    const stock = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json(stock);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

// GET: Fetch all inventory units linked to a specific donor name or user
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
    const { id } = req.params;
    const deletedUnit = await Inventory.findByIdAndDelete(id);
    if (!deletedUnit) return res.status(404).json({ success: false, message: "Unit not found" });
    res.json({ success: true, message: "Unit purged from registry." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/inventory/bulk-dispatch', async (req, res) => {
  try {
    const { unitIds, destination } = req.body;
    await Inventory.updateMany(
      { _id: { $in: unitIds } }, 
      { $set: { status: 'dispatched' } } 
    );
    res.json({ success: true, message: `${unitIds.length} units dispatched to ${destination}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Bulk dispatch failed." });
  }
});


// --- 3. APPOINTMENT & INTAKE ROUTES ---
app.post('/api/appointments/book', async (req, res) => {
  console.log("📥 Incoming Booking:", req.body);
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json({ success: true, message: "Appointment Locked In!" });
  } catch (err) {
    console.log("🔥 DB Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// The Bulletproof Promote Route
app.post('/api/inventory/promote', async (req, res) => {
  try {
    // 1. Extract hubId from the incoming payload
    const { appointmentId, userId, donorName, bloodGroup, volume, hubId } = req.body;

    // Safety Check: Now explicitly requires the Hub ID
    if (!userId || !appointmentId || !hubId) {
      return res.status(400).json({ success: false, message: "Missing User, Appointment, or Hub ID" });
    }

    // 2. Create the Inventory Unit with Geospatial Tagging
    const unitId = `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newUnit = new Inventory({
      unitId,
      bloodGroup,
      collectionDate: new Date(),
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      status: 'available',
      donorName,
      donorId: userId, // Links back to user profile
      hubId // <--- Ties this specific unit to the physical location
    });
    await newUnit.save();

    // 3. Mark Appointment as Completed
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });

    // 4. Update User Stats Safely
    await User.findByIdAndUpdate(
      userId, 
      {
        $inc: { donationsCount: 1, totalVolume: Number(volume) || 450 },
        $set: { lastDonationDate: new Date() }
      },
      { new: true, runValidators: false } // Bypasses the strict role validation during increment
    );

    res.status(201).json({ success: true, message: "Unit Promoted & Tagged to Hub" });
  } catch (err) {
    console.error("🔥 PROMOTION ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 4. HOSPITAL REQUEST ROUTES ---
app.post('/api/requests/create', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json({ success: true, message: "Request Broadcasted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

app.get('/api/requests/match/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // 1. Find all available inventory of the requested blood group
    const availableUnits = await Inventory.find({ 
      bloodGroup: request.bloodGroup, 
      status: 'available' 
    }).populate('hubId');

    // 2. Map and Calculate Real Distances
    const rankedMatches = availableUnits.map(unit => {
      // Ensure unit is actually tied to a hub
      if (!unit.hubId || !unit.hubId.location) return null;

      const distance = calculateDistance(
        request.location.lat, 
        request.location.lng,
        unit.hubId.location.lat, 
        unit.hubId.location.lng
      );
      
      return {
        ...unit._doc,
        distance: Number(distance.toFixed(2)),
        // 4 mins per km in Ludhiana traffic + 10 min prep/loading
        estimatedTime: Math.round(distance * 4 + 10) 
      };
    })
    .filter(unit => unit !== null) // Remove units with missing hub data
    .sort((a, b) => a.distance - b.distance); 

    res.json(rankedMatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/requests/resolve/:requestId/:inventoryId', async (req, res) => {
  try {
    const { requestId, inventoryId } = req.params;
    await Inventory.findByIdAndDelete(inventoryId);
    await Request.findByIdAndDelete(requestId);
    
    res.json({ success: true, message: "Blood Dispatched & Inventory Updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE: Cancel a pending request manually (Hospital side)
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.json({ success: true, message: "Request Aborted." });
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