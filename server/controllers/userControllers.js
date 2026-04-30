const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register a new student
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, department, year, image, linkedin, github } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user with the Cloudinary image URL
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      year,
      image, // This saves the https://res.cloudinary.com/... link
      linkedin,
      github
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image, // Send this back so React can display it immediately
        role: 'student'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};