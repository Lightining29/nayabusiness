const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes – expects Authorization: Bearer <token>
module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    // Attach the full user doc (without password) to request
    const user = await User.findById(payload.id).select('-password -resume');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
