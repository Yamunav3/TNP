

// const mongoose = require('mongoose');

// const applicationSchema = new mongoose.Schema({
//   driveId: {
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Drive',
//     required: true // <--- This causes the error if driveId is missing
//   },
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true // <--- This causes the error if studentId is missing
//   },
//   status: {
//     type: String,
//     enum: ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'rejected'],
//     default: 'applied'
//   },
//   appliedDate: {
//     type: Date,
//     default: Date.now
//   }
// });

// // This line ensures a student can't apply to the same drive twice
// applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

// module.exports = mongoose.model('Application', applicationSchema);


// authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Get the token from the header (Bearer token...)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token
    // Make sure you have JWT_SECRET in your .env file!
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret_key');

    // 3. Add the user payload to the request object so controllers can use it
    req.user = decoded;
    
    // 4. Move to the next function (the controller)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};