import express from 'express';
import * as dashboardController from '../controller/dashboardController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Dashboard routes - all require authentication
router.use(authenticate);

// Dashboard home - summary stats
router.get('/stats', dashboardController.getDashboardStats);

// Access logs with filtering
router.get('/logs', authorizeAdmin, dashboardController.getAccessLogs);

// Contextual access statistics
router.get('/contextual', authorizeAdmin, dashboardController.getContextualStats);

// Team performance metrics
router.get('/team-metrics', authorizeAdmin, dashboardController.getTeamMetrics);

// User analytics
router.get('/user-analytics', authorizeAdmin, dashboardController.getUserAnalytics);

// Dashboard home page - render the main dashboard view
router.get('/', (req, res) => {
  res.render('dashboard', { user: req.user });
});

export default router;