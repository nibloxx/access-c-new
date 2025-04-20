import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createResource, deleteResource, getAllResources, updateResource } from '../controller/resourceController.js';


const router = express.Router();

// Public routes (if any)

// Protected routes
router.get('/', authenticate, getAllResources);
router.post('/', authenticate, createResource);
router.put('/:id', authenticate, updateResource);
router.delete('/:id', authenticate, deleteResource);

export default router;