import express from 'express';
import * as teamController from '../controller/teamController.js';
import { authenticate, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes

router.use(authenticate);
// Get all teams
router.get('/', teamController.getAllTeams);

// Get team by ID
router.get('/:id', teamController.getTeamById);

// Get teams for a project
router.get('/project/:projectId', teamController.getProjectTeams);

// Create team (requires Admin or Manager role)
router.post('/', 
  checkRole(['Admin', 'Manager']),
  teamController.createTeam
);

// Update team
router.put('/:id', 
  checkRole(['Admin', 'Manager']),
  teamController.updateTeam
);

// Delete team
router.delete('/:id', 
  checkRole(['Admin']),
  teamController.deleteTeam
);

export default router;