const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String }, // Stores the Cloudinary URL
  linkedin: { type: String },
  github: { type: String },
  phone: { type: String },
  address: { type: String },
  resumeUrl: { type: String },
  password: { type: String },
  headline: { type: String, default: 'Student' },
  // Fields from Register.tsx
  department: { type: String }, // e.g., "Computer Science"
  year: { type: String },       // e.g., "2025"
  
  // Role handling (Login.tsx has Student/Admin toggle)
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  
  // OAuth fields
  oauth: [{
    provider: { type: String, enum: ['google', 'github'] },
    oauthId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date }
  }],
  
  // Additional profile fields (can be updated later)
  cgpa: { type: Number, default: 0 },
  backlogs: { type: Number, default: 0 },
  skills: [String],
  certs: [{
    name: String,
    issuer: String,
    date: String,
    image: String
  }],
  // --- ADD THIS: DOCUMENTS ---
  documents: [{
    name: String,
    docType: String, // 'pdf' or 'image'
    date: String,
    url: String
  }],
  resetPasswordToken: String,
resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);