import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware - Practical 7
 * Verifies JWT token from 'Authorization: Bearer <token>' header
 * Attaches decoded user document to req.user
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Authorization token missing. Use: Authorization: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError'
        ? 'Session expired. JWT token has expired, please log in again.'
        : 'Invalid authentication token.'
    });
  }
};
