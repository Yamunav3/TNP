
const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  role: { type: String, required: true },
  package: { type: String, required: true },
  location: { type: String, required: true },
  jobType: { type: String, default: 'Full-time' },
  description: { type: String },
  requirements: [String],
  applicationLink: { type: String }, // External application link
  
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    allowedBranches: [String],
    batch: [Number]
  },
  
  selectionProcess: [{
    round: Number,
    name: String,
    description: String
  }],
  
  deadline: { type: Date, required: true },
  postedDate: { type: Date, default: Date.now },
  totalApplicants: { type: Number, default: 0 }
});

module.exports = mongoose.model('Drive', driveSchema);