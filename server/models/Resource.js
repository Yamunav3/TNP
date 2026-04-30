const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['DSA Sheet', 'Aptitude', 'Recruitment Process', 'Company Material'] 
  },
  companyName: { type: String, default: 'General' },
  pdfUrl: { type: String, required: true }, // URL from Cloudinary
  cloudinaryId: { type: String }, // To identify the file in Cloudinary if we need to delete it
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);