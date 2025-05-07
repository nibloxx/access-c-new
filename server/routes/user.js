import express from 'express';
import * as userController from '../controller/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes - all require authentication
router.use(authenticate);

// Get all users - admin only
router.get('/', authorizeAdmin, userController.getAllUsers);

// Get user by ID - admin or self
router.get('/:id', userController.getUserById);

// Create new user - admin only
router.post('/', authorizeAdmin, userController.createUser);

// Update user - admin or self
router.put('/:id', userController.updateUser);

// Delete user - admin only
router.delete('/:id', authorizeAdmin, userController.deleteUser);

// Update user profile - self only
router.put('/profile/:id', userController.updateUserProfile);
export default router;