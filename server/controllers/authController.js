const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerController = async (req, res) => {
  try {
    // 1. Destructure with the new 'address' and 'coords' naming
    const { name, email, password, role, bloodGroup, licenseId, address, coords } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password (Maximum Security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Map the incoming data to our new Schema structure
    const newUser = new User({
      name, 
      email, 
      password: hashedPassword, 
      role, 
      bloodGroup, 
      licenseId, 
      address, // Renamed from location
      coords   // { lat, lng } from our Leaflet map
    });
    
    await newUser.save();

    res.status(201).json({ success: true, message: "User Registered Successfully!" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // 3. Create a Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_fallback_secret', // Always use .env in production
      { expiresIn: '1d' }
    );

    // 4. Send Response - Now including location data for the frontend Map
    res.status(200).json({
      success: true,
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        role: user.role,
        bloodGroup: user.bloodGroup,
        address: user.address, // Added for UI display
        coords: user.coords    // Added so the Map knows where 'Home' is
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login Error", error: error.message });
  }
};