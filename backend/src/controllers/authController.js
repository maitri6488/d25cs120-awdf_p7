import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper: Sign JWT token with 1-hour expiry
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required fields.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name: name || 'Maitri Sheta',
      studentId: studentId || 'D25CS120',
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully with hashed password.',
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful. JWT token generated.',
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user profile (Supplementary Requirement)
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
