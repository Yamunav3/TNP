

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  driveId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Drive',
    required: true // <--- This causes the error if driveId is missing
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // <--- This causes the error if studentId is missing
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'rejected'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

// This line ensures a student can't apply to the same drive twice
applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);