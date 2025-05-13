import express from 'express';
import * as projectController from '../controller/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { checkProjectPermission, checkProjectRole } from '../middleware/projectAuth.js';

const router = express.Router();

// Apply base authentication to all routes
router.use(authenticate);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get project by ID
router.get('/:id', 
  checkProjectPermission('canView'),
  projectController.getProjectById
);

// Create project
router.post('/', 
  checkProjectRole(['Admin', 'Manager']),
  checkProjectPermission('canCreate'),
  projectController.createProject
);

// Update project
router.put('/:id', 
  checkProjectPermission('canEdit'),
  projectController.updateProject
);

// Delete project
router.delete('/:id', 
  checkProjectRole(['Admin']),
  checkProjectPermission('canEdit'),
  projectController.deleteProject
);

export default router;