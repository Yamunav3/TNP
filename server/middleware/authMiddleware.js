
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