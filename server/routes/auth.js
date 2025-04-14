
import express from 'express';
import * as authController from '../controller/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);

export default router;