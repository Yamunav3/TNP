const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    questionHash: { type: String, required: true, unique: true, index: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: 'Quiz question must contain exactly 4 options.',
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true, trim: true },
    topic: { type: String, required: true, lowercase: true, trim: true, index: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'medium', 'hard'],
      index: true,
    },
    isFrequentlyAsked: { type: Boolean, default: true, index: true },
    timesServed: { type: Number, default: 0, index: true },
    servedToUsers: { type: [String], default: [] },
    lastServedAt: { type: Date, default: null },
    source: { type: String, default: 'ai' },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ topic: 1, difficulty: 1, timesServed: 1, createdAt: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
