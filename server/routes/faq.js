import express from 'express';
import * as faqController from '../controller/faqController.js';  // Fixed import path
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', faqController.getAllFaqs);
router.get('/:id', faqController.getFaqById);

// Protected routes (require authentication)
router.post('/', authenticate, faqController.createFaq);
router.put('/:id', authenticate, faqController.updateFaq);
router.delete('/:id', authenticate, faqController.deleteFaq);

export default router;