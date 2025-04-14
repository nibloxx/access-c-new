import express from 'express';
import * as teamController from '../controller/teamController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Team routes - all require authentication
router.use(authenticate);

// Get all teams
router.get('/', teamController.getAllTeams);

// Get team by ID
router.get('/:id', teamController.getTeamById);

// Create team - admin only
router.post('/', authorizeAdmin, teamController.createTeam);

// Update team - admin only
router.put('/:id', authorizeAdmin, teamController.updateTeam);

// Delete team - admin only
router.delete('/:id', authorizeAdmin, teamController.deleteTeam);

export default router;