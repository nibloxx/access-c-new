import express from 'express';
import * as projectController from '../controller/projectController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Project routes - all require authentication
router.use(authenticate);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Create project - admin only
router.post('/', authorizeAdmin, projectController.createProject);

// Update project - admin only
router.put('/:id', authorizeAdmin, projectController.updateProject);

// Delete project - admin only
router.delete('/:id', authorizeAdmin, projectController.deleteProject);

export default router;