const mongoose = require('mongoose');

const MentorshipRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alumni: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumni',
        required: true
    },
    requestType: {
        type: String,
        enum: ['Resume Review', 'Career Advice', 'Mock Interview', 'Other'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    meetingDate: {
        type: Date
    },
    meetingLink: {
        type: String
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('MentorshipRequest', MentorshipRequestSchema);
