const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drive',
    },
    interviewRounds: [
        {
            roundName: { type: String, required: true },
            questions: [{ type: String, required: true }],
            difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
            duration: { type: Number }, // in minutes
        }
    ],
    overallExperience: {
        type: String,
        required: true
    },
    selected: {
        type: Boolean,
        default: false
    },
    tips: {
        type: String
    },
    difficultyRating: {
        type: Number,
        min: 1,
        max: 5
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    views: {
        type: Number,
        default: 0
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
