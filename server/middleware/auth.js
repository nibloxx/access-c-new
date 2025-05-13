import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { logActivity } from '../utils/logger.js';
import Role from '../model/Role.js';
import Team from '../model/Team.js';
import AccessLog from '../model/AccessLog.js';
import Project from '../model/Project.js';
import { ROLES } from '../utils/constrants.js';

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
  const hasAdminRole = req.user.roles.some(role => ['SuperAdmin', 'Admin'].includes(role));
  if (!hasAdminRole) {
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



// Define allowed roles at the top of the file
const ALLOWED_ROLES = ['SuperAdmin', 'Admin', 'Manager'];

export const checkPhasePermission = (action) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('teams');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = req.user;
    const currentPhase = project.currentPhase;
    
    // Check if user has any of the allowed roles first
    const hasAllowedRole = user.roles.some(role => ALLOWED_ROLES.includes(role));

    // Block create/update/delete operations for non-allowed roles
    if (['createProject', 'updateProject', 'deleteProject'].includes(action) && !hasAllowedRole) {
      logActivity('unauthorizedAccess', user._id, false, {
        projectId: id,
        action,
        phase: currentPhase,
        roles: user.roles
      });
      return res.status(403).json({ 
        message: 'Access denied: Only SuperAdmin, Admin, and Manager can perform this action',
        requiredRoles: ALLOWED_ROLES
      });
    }

    // For other actions, check phase-specific permissions
    const phasePermissions = project.phasePermissions[currentPhase];
    if (!phasePermissions) {
      return res.status(400).json({ 
        message: `Invalid project phase: ${currentPhase}`
      });
    }

    // Check permissions based on action type
    const hasPermission = user.roles.some(role => {
      switch (action) {
        case 'createProject':
        case 'updateProject':
        case 'deleteProject':
          return ALLOWED_ROLES.includes(role);
        
        case 'viewDocuments':
          return phasePermissions.canViewDocuments.includes(role);
        
        case 'editModels':
          if (currentPhase === 'review' && role === ROLES.CONTRACTOR) {
            return false;
          }
          return phasePermissions.canEditModels.includes(role);
        
        default:
          return false;
      }
    });

    if (!hasPermission) {
      logActivity('phasePermissionDenied', user._id, false, {
        projectId: id,
        action,
        phase: currentPhase,
        roles: user.roles
      });

      return res.status(403).json({ 
        message: `${action} not allowed for your role`,
        phase: currentPhase,
        requiredRoles: ALLOWED_ROLES
      });
    }

    // Add phase context to request
    req.phaseContext = {
      currentPhase,
      permissions: phasePermissions,
      project,
      isAllowedRole: hasAllowedRole
    };

    next();
  } catch (error) {
    console.error('Permission check failed:', error);
    res.status(500).json({ 
      message: 'Permission check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};