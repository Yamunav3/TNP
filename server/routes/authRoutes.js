const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved in server/uploads
  },
  filename: (req, file, cb) => {
    // Rename file to avoid duplicates (e.g., resume-123456789.pdf)
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// @route   POST /api/auth/register
// @desc    Register a new student


router.post('/register', async (req, res) => {
  const { name, email, password, department, year } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      year,
      role: 'student' // Default role for registration page
    });

    // 4. Generate Token
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @desc    Auth user & get token
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // --- 1. HARDCODED ADMIN CHECK ---
    if (email === 'admin@tnp.edu' && password === 'admin123') {
      
      // Verify the user is actually trying to login as admin
      if (role && role !== 'admin') {
         return res.status(401).json({ message: "This account is for Admins only." });
      }

      // Return Admin Token immediately (No DB check needed)
      return res.json({
        _id: 'admin-static-id',
        name: 'TNP Administrator',
        email: 'admin@tnp.edu',
        role: 'admin',
        token: jwt.sign({ id: 'admin-static-id', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' }),
      });
    }

    // --- 2. REGULAR DATABASE LOGIN (For Students) ---
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Optional: Strict Role Check
      if (role && user.role !== role) {
        return res.status(401).json({ message: `Access denied. You are not an ${role}.` });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        cgpa: user.cgpa,
        skills: user.skills,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', async (req, res) => {
  const { userId, ...updates } = req.body; // We send userId and the fields to update

  try {
    // Find user by ID and update specific fields
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, // This updates only the fields you send (e.g., cgpa, phone)
      { new: true, runValidators: true } // Return the updated user object
    );

    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        cgpa: user.cgpa,         // <--- Ensure these are returned
        backlogs: user.backlogs, // <---
        phone: user.phone,       // <---
        address: user.address,   // <---
        skills: user.skills,
        token: req.headers.authorization?.split(' ')[1] // Keep existing token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ... imports ...

// @route POST /api/auth/upload
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // --- FIX 3: Construct the Full URL ---
    // Ensure this matches your server port (5000)
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    res.json({ 
      message: 'File uploaded successfully',
      filePath: fileUrl, // <--- This full URL is what the frontend needs
      fileName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = router;