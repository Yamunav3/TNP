const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  round: { type: String, required: true }, // e.g., "Technical Round 1", "HR Round"
  interviewType: {
    type: String,
    enum: ['online', 'offline', 'phone', 'group'],
    default: 'online'
  },
  interviewDate: { type: Date, required: true },
  interviewTime: { type: String, required: true }, // e.g., "10:00 AM"
  duration: { type: Number, default: 60 }, // in minutes
  interviewLink: { type: String }, // For online interviews
  location: { type: String }, // For offline interviews
  interviewer: { type: String }, // Name of interviewer
  interviewerEmail: { type: String }, // Email of interviewer
  description: { type: String }, // Details about the interview
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  
  // Manual vs Automatic
  scheduledBy: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  
  remarks: { type: String }, // Admin remarks
  outcome: { type: String }, // Result after interview (passed, failed, on_hold)
  
  // Notification tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
interviewScheduleSchema.index({ studentId: 1, interviewDate: 1 });
interviewScheduleSchema.index({ driveId: 1, interviewDate: 1 });

module.exports = mongoose.model('InterviewSchedule', interviewScheduleSchema);
