const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
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
    yearOfGraduation: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    linkedinUrl: {
        type: String
    },
    githubUrl: {
        type: String
    },
    skills: [{ type: String }],
    isAvailableForMentorship: {
        type: Boolean,
        default: true
    },
    mentorshipTopics: [{ type: String }],
    maxMentees: {
        type: Number,
        default: 5
    },
    currentMentees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 4.5
    },
    reviews: [
        {
            reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Alumni', AlumniSchema);
