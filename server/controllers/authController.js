const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerController = async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, licenseId, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password (Maximum Security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save the user
    const newUser = new User({
      name, 
      email, 
      password: hashedPassword, 
      role, 
      bloodGroup, 
      licenseId, 
      location
    });
    await newUser.save();

    res.status(201).json({ success: true, message: "User Registered Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user and include sensitive data for verification
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Compare Bcrypt Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // 3. Create a Token that expires in 1 day
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 4. Send Response - FIXED: Changed 'id' to '_id' to sync with frontend
    res.status(200).json({
      success: true,
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        role: user.role,
        bloodGroup: user.bloodGroup // Added so User.Hub shows real data
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login Error", error: error.message });
  }
};