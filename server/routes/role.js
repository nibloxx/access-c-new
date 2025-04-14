import express from 'express';
import * as roleController from '../controller/roleController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Role routes - all require authentication
router.use(authenticate);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Create role - admin only
router.post('/', authorizeAdmin, roleController.createRole);

// Update role - admin only
router.put('/:id', authorizeAdmin, roleController.updateRole);

// Delete role - admin only
router.delete('/:id', authorizeAdmin, roleController.deleteRole);

export default router;