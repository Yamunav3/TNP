const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
  const { name, email, password, department, year, image, linkedin, github } = req.body;

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
      image,
      linkedin,
      github,
      role: 'student' // Default role for registration page
    });

    // 4. Generate Token
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        image: user.image,
        linkedin: user.linkedin,
        github: user.github,
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
        image: user.image,
        linkedin: user.linkedin,
        github: user.github,
        phone: user.phone,
        address: user.address,
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
        image: user.image,
        linkedin: user.linkedin,
        github: user.github,
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
    const fileUrl = `http://localhost:5002/uploads/${req.file.filename}`;
    
    res.json({ 
      message: 'File uploaded successfully',
      filePath: fileUrl, // <--- This full URL is what the frontend needs
      fileName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  const { registerUser } = require('../controllers/userControllers');

// Define the registration route
router.post('/register', registerUser);
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', async (req, res) => {
  try {
    console.log("📧 Forgot password request for:", req.body.email);

    // 1. Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("❌ User not found:", req.body.email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);

    // 2. Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("🔑 Reset token generated:", resetToken.substring(0, 5) + "...");

    // 3. Hash token and set to database field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();
    console.log("💾 Token saved to database");

    // 4. Send Email via Brevo SMTP (with fallback for testing)
    const resetUrl = `http://localhost:8080/reset-password/${resetToken}`;
    
    try {
      console.log("📨 Attempting to send email via Brevo...");
      console.log("  Host:", process.env.EMAIL_HOST);
      console.log("  Port:", process.env.EMAIL_PORT);
      console.log("  User:", process.env.EMAIL_USER?.substring(0, 5) + "...");

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'user@brevo.com',
          pass: process.env.EMAIL_PASS || process.env.BREVO_API_KEY
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'yamunav32006@gmail.com',
        to: user.email,
        subject: 'Password Reset Request - TNP Portal',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your TNP Portal account.</p>
          <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      console.log("✅ Email sent successfully to:", user.email);
      res.status(200).json({ message: "Reset email sent successfully" });
    } catch (emailErr) {
      // If email fails, still save the token but return warning
      console.warn("⚠️ Email send failed:", emailErr.message);
      console.log("🔑 Reset token (for testing):", resetToken);
      res.status(200).json({ 
        message: "Reset link created. Email service unavailable - you can use test token if provided.",
        _testToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    }
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    console.error("   Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Failed to process reset request. Please try again later.",
      _debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    console.log("🔐 Reset password request received");
    console.log("   Token:", token?.substring(0, 10) + "...");
    console.log("   Password length:", password?.length);

    if (!token || !password || !confirmPassword) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      console.log("❌ Passwords don't match");
      return res.status(400).json({ message: "Passwords don't match" });
    }

    // 1. Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log("🔑 Hashed token:", hashedToken.substring(0, 10) + "...");

    // 2. Find user with matching reset token and token not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) {
      console.log("❌ No user found with this token or token expired");
      console.log("   Current time:", Date.now());
      
      // Debug: check if token exists at all (regardless of expiry)
      const debugUser = await User.findOne({ resetPasswordToken: hashedToken });
      if (debugUser) {
        console.log("   Token exists but expired at:", debugUser.resetPasswordExpire);
      }
      
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log("✅ User found:", user.email);

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    console.log("✅ Password reset successfully for:", user.email);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    console.error("   Stack trace:", err.stack);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = router;