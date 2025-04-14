import User from '../model/User.js';
import Team from '../model/Team.js';
import Role from '../model/Role.js';
import Project from '../model/Project.js';
import AccessLog from '../model/AccessLog.js';

// Dashboard home - summary statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts of key entities
    const userCount = await User.countDocuments();
    const teamCount = await Team.countDocuments();
    const roleCount = await Role.countDocuments();
    const projectCount = await Project.countDocuments();
    
    // Project phase statistics
    const projectPhases = await Project.aggregate([
      { $group: { _id: '$currentPhase', count: { $sum: 1 } } }
    ]);
    
    // Recent access logs (limited to 10)
    const recentLogs = await AccessLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'username');
    
    // User activity statistics (logins in the past week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const userActivity = await User.aggregate([
      { 
        $match: { lastLogin: { $gte: oneWeekAgo } }
      },
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Team size distribution
    const teamSizes = await Team.aggregate([
      { $project: { name: 1, memberCount: { $size: "$members" } } },
      { $sort: { memberCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Return all stats
    res.json({
      counts: {
        users: userCount,
        teams: teamCount,
        roles: roleCount,
        projects: projectCount
      },
      projectPhases,
      recentLogs,
      userActivity,
      teamSizes
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get access logs with filtering
export const getAccessLogs = async (req, res) => {
  try {
    const { user, action, resource, granted, startDate, endDate, limit = 50 } = req.query;
    
    // Build filter criteria
    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (granted !== undefined) filter.granted = granted === 'true';
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AccessLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('user', 'username email');
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contextual access statistics
export const getContextualStats = async (req, res) => {
  try {
    // Location-based access patterns
    const locationStats = await AccessLog.aggregate([
      { $match: { 'contextData.location': { $exists: true } } },
      { $group: { 
        _id: '$contextData.location', 
        totalAccess: { $sum: 1 },
        granted: { $sum: { $cond: ['$granted', 1, 0] } },
        denied: { $sum: { $cond: ['$granted', 0, 1] } }
      }},
      { $sort: { totalAccess: -1 } },
      { $limit: 10 }
    ]);
    
    // Device-based access patterns
    const deviceStats = await AccessLog.aggregate([
      { $match: { 'contextData.device': { $exists: true } } },
      { 
        $addFields: {
          deviceType: {
            $cond: {
              if: { $regexMatch: { input: "$contextData.device", regex: /mobile|android|iphone|ipad/i } },
              then: "Mobile",
              else: {
                $cond: {
                  if: { $regexMatch: { input: "$contextData.device", regex: /tablet/i } },
                  then: "Tablet",
                  else: "Desktop"
                }
              }
            }
          }
        }
      },
      { $group: { 
        _id: '$deviceType', 
        totalAccess: { $sum: 1 },
        granted: { $sum: { $cond: ['$granted', 1, 0] } },
        denied: { $sum: { $cond: ['$granted', 0, 1] } }
      }},
      { $sort: { totalAccess: -1 } }
    ]);
    
    // Time-based access patterns
    const timeStats = await AccessLog.aggregate([
      { 
        $addFields: {
          hour: { $hour: "$timestamp" }
        }
      },
      { $group: { 
        _id: '$hour', 
        totalAccess: { $sum: 1 },
        granted: { $sum: { $cond: ['$granted', 1, 0] } },
        denied: { $sum: { $cond: ['$granted', 0, 1] } }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      locationStats,
      deviceStats,
      timeStats
    });
  } catch (error) {
    console.error('Error fetching contextual stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team performance metrics
export const getTeamMetrics = async (req, res) => {
  try {
    // Team access statistics
    const teamAccessStats = await Team.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'members.user',
          foreignField: '_id',
          as: 'teamUsers'
        }
      },
      {
        $lookup: {
          from: 'accesslogs',
          let: { userIds: '$teamUsers._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$user', '$$userIds'] }
              }
            },
            {
              $group: {
                _id: null,
                totalAccess: { $sum: 1 },
                granted: { $sum: { $cond: ['$granted', 1, 0] } },
                denied: { $sum: { $cond: ['$granted', 0, 1] } }
              }
            }
          ],
          as: 'accessStats'
        }
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: '$members' },
          projectCount: { $size: '$projects' },
          accessStats: { $arrayElemAt: ['$accessStats', 0] }
        }
      },
      { $sort: { memberCount: -1 } }
    ]);
    
    // Project phase transition statistics
    const phaseTransitions = await Project.aggregate([
      { $unwind: '$phaseHistory' },
      { $match: { 'phaseHistory.endDate': { $ne: null } } },
      {
        $project: {
          name: 1,
          phase: '$phaseHistory.phase',
          duration: {
            $divide: [
              { $subtract: ['$phaseHistory.endDate', '$phaseHistory.startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$phase',
          avgDuration: { $avg: '$duration' },
          maxDuration: { $max: '$duration' },
          minDuration: { $min: '$duration' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgDuration: 1 } }
    ]);
    
    res.json({
      teamAccessStats,
      phaseTransitions
    });
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    // User role distribution
    const roleDistribution = await Role.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'roles',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          userCount: { $size: '$users' }
        }
      },
      { $sort: { userCount: -1 } }
    ]);
    
    // User access patterns
    const userActivity = await AccessLog.aggregate([
      {
        $group: {
          _id: '$user',
          totalAccess: { $sum: 1 },
          granted: { $sum: { $cond: ['$granted', 1, 0] } },
          denied: { $sum: { $cond: ['$granted', 0, 1] } }
        }
      },
      { $sort: { totalAccess: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          username: { $arrayElemAt: ['$userDetails.username', 0] },
          email: { $arrayElemAt: ['$userDetails.email', 0] },
          totalAccess: 1,
          granted: 1,
          denied: 1
        }
      }
    ]);
    
    // High deny rate users
    const highDenyUsers = await AccessLog.aggregate([
      {
        $group: {
          _id: '$user',
          totalAccess: { $sum: 1 },
          denied: { $sum: { $cond: ['$granted', 0, 1] } },
          denyRate: {
            $avg: { $cond: ['$granted', 0, 1] }
          }
        }
      },
      { $match: { totalAccess: { $gt: 5 } } },
      { $sort: { denyRate: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          username: { $arrayElemAt: ['$userDetails.username', 0] },
          totalAccess: 1,
          denied: 1,
          denyRate: 1
        }
      }
    ]);
    
    res.json({
      roleDistribution,
      userActivity,
      highDenyUsers
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};