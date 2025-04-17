import express from 'express';
import * as authController from '../controller/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', authController.login);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);

export default router;