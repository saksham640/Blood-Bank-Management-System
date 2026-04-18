const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes (We'll build these next)
app.post('/api/auth/register', require('./controllers/authController').registerController);
app.post('/api/auth/login', require('./controllers/authController').loginController);

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ DB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));