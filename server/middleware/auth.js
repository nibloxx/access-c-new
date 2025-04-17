import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { logActivity } from '../utils/logger.js';
import Role from '../model/Role.js';
import Team from '../model/Team.js';
import AccessLog from '../model/AccessLog.js';
import Project from '../model/Project.js';

// Authenticate user middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token, user not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Authorize admin middleware
export const authorizeAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    // Log unauthorized access attempt
    logActivity('unauthorizedAccess', req.user._id, false, {
      resource: req.originalUrl,
      method: req.method
    });
    
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// Context-aware access control middleware
export const contextAwareAccess = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const currentTime = new Date();
      const userDevice = req.headers['user-agent'];
      const userIp = req.ip;
      
      // Compile user permissions from their roles
      const roles = await Role.find({ _id: { $in: user.roles } });
      const userPermissions = roles.flatMap(role => role.permissions);
      
      // Check if user has all required permissions
      const hasPermissions = requiredPermissions.every(perm => 
        userPermissions.includes(perm)
      );
      
      // Contextual checks (example: time-based restriction)
      const isWorkingHours = currentTime.getHours() >= 9 && currentTime.getHours() < 18;
      
      // Get user's teams to check team-based access
      const teams = await Team.find({ 'members.user': user._id });
      
      // Find projects the user is involved with through teams
      const projects = await Project.find({ teams: { $in: teams.map(t => t._id) } });
      
      // Example of phase-based permission adjustment
      const relevantProject = projects.find(p => p._id.toString() === req.params.projectId);
      const isReviewPhase = relevantProject && relevantProject.currentPhase === 'review';
      
      // Determine if access should be granted based on all factors
      const shouldGrantAccess = 
        hasPermissions && 
        (isWorkingHours || user.isAdmin) && 
        (!isReviewPhase || user.isAdmin || userPermissions.includes('review_access'));
      
      // Log the access attempt
      const accessLog = new AccessLog({
        user: user._id,
        action: req.method,
        resource: req.originalUrl,
        granted: shouldGrantAccess,
        contextData: {
          time: currentTime,
          device: userDevice,
          ipAddress: userIp
        }
      });
      await accessLog.save();
      
      if (!shouldGrantAccess) {
        return res.status(403).json({ 
          message: 'Access denied: Insufficient permissions or contextual restrictions',
          context: {
            hasPermissions,
            isWorkingHours,
            isReviewPhase
          }
        });
      }
      
      next();
    } catch (error) {
      console.error('Context-aware access error:', error);
      res.status(500).json({ message: 'Error in access control' });
    }
  };
};