import Project from '../model/Project.js';
import { checkPhasePermission } from '../utils/permissions.js';

// Middleware to check project phase permissions
export const checkProjectPermission = (permissionType) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id;
      
      // For project creation, check planning phase permissions
      if (!projectId) {
        if (!checkPhasePermission(req.user, 'planning', permissionType)) {
          return res.status(403).json({ 
            message: 'You do not have permission to perform this action' 
          });
        }
        return next();
      }

      // For existing projects, check current phase permissions
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (!checkPhasePermission(req.user, project.currentPhase, permissionType)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action in the current phase' 
        });
      }

      // Attach project to request for use in controller
      req.project = project;
      next();
    } catch (error) {
      console.error('Project permission check failed:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Middleware to check if user has required roles
export const checkProjectRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ 
        message: 'You do not have the required role for this action' 
      });
    }

    next();
  };
}; 