import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/logger.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login and context data
    user.lastLogin = new Date();
    user.contextData.lastDevice = req.headers['user-agent'];
    user.contextData.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      device: req.headers['user-agent'],
      location: 'Unknown' // In production, use geolocation service
    });
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'dtbac-secret',
      { expiresIn: '1h' }
    );
    
    // Log activity
    logActivity('login', user._id, true, {
      ipAddress: req.ip,
      device: req.headers['user-agent']
    });
    
    res.json({ token, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'Already logged out' });
  }
};