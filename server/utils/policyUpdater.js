// server/utils/policyUpdater.js
const AccessLog = require('../model/AccessLog');
const User = require('../model/User');
const Role = require('../model/Role');
const Team = require('../model/Team');

// Machine learning-based policy adaptation system
exports.analyzeAccessPatterns = async () => {
  try {
    // Get access logs for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const accessLogs = await AccessLog.find({
      timestamp: { $gte: thirtyDaysAgo }
    }).populate('user');
    
    // Identify denied access patterns
    const deniedAccessPatterns = accessLogs
      .filter(log => !log.granted)
      .reduce((patterns, log) => {
        const key = `${log.user._id}-${log.resource}`;
        if (!patterns[key]) {
          patterns[key] = { count: 0, user: log.user, resource: log.resource };
        }
        patterns[key].count++;
        return patterns;
      }, {});
    
    // Identify potential permission updates - users who frequently try to access
    // resources they don't have permission for
    const potentialUpdates = Object.values(deniedAccessPatterns)
      .filter(pattern => pattern.count >= 5) // Threshold for frequency
      .map(pattern => ({
        userId: pattern.user._id,
        username: pattern.user.username,
        resource: pattern.resource,
        deniedCount: pattern.count
      }));
    
    // Identify successful access patterns outside normal hours
    const afterHoursAccess = accessLogs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return log.granted && (hour < 9 || hour >= 18);
    });
    
    // Group by user to see who consistently works outside normal hours
    const afterHoursUsers = afterHoursAccess.reduce((users, log) => {
      if (!users[log.user._id]) {
        users[log.user._id] = { count: 0, user: log.user };
      }
      users[log.user._id].count++;
      return users;
    }, {});
    
    // Filter for users with significant after-hours activity
    const significantAfterHoursUsers = Object.values(afterHoursUsers)
      .filter(u => u.count >= 10)
      .map(u => ({
        userId: u.user._id,
        username: u.user.username,
        afterHoursAccessCount: u.count
      }));
    
    return {
      potentialPermissionUpdates: potentialUpdates,
      afterHoursWorkPatterns: significantAfterHoursUsers,
      analysisPeriod: { start: thirtyDaysAgo, end: new Date() }
    };
  } catch (error) {
    console.error('Error analyzing access patterns:', error);
    return { error: 'Analysis failed', details: error.message };
  }
};

// Apply suggested policy updates automatically
exports.applyPolicyUpdates = async (updates, autoApprove = false) => {
  const results = {
    applied: [],
    pending: [],
    failed: []
  };
  
  try {
    for (const update of updates) {
      // Extract resource path and action
      const resourceParts = update.resource.split('/');
      const resourceType = resourceParts[2] || 'unknown'; // e.g., 'users', 'teams'
      const actionMethod = update.resource.split(' ')[0] || 'GET'; // HTTP method
      
      // Determine which permission to add
      let permissionToAdd;
      switch (resourceType) {
        case 'users':
          permissionToAdd = 'user_view';
          break;
        case 'teams':
          permissionToAdd = 'team_view';
          break;
        case 'projects':
          permissionToAdd = 'project_view';
          break;
        default:
          permissionToAdd = `${resourceType}_access`;
      }
      
      if (actionMethod === 'POST') permissionToAdd = permissionToAdd.replace('view', 'create');
      if (actionMethod === 'PUT') permissionToAdd = permissionToAdd.replace('view', 'edit');
      if (actionMethod === 'DELETE') permissionToAdd = permissionToAdd.replace('view', 'delete');
      
      // Find user and their roles
      const user = await User.findById(update.userId).populate('roles');
      if (!user) {
        results.failed.push({
          ...update,
          reason: 'User not found'
        });
        continue;
      }
      
      // If auto-approve, add permission to the user's first role
      if (autoApprove && user.roles.length > 0) {
        const roleToUpdate = await Role.findById(user.roles[0]._id);
        
        if (!roleToUpdate.permissions.includes(permissionToAdd)) {
          roleToUpdate.permissions.push(permissionToAdd);
          await roleToUpdate.save();
          
          results.applied.push({
            ...update,
            permission: permissionToAdd,
            role: roleToUpdate.name
          });
        } else {
          results.failed.push({
            ...update,
            reason: 'Permission already exists'
          });
        }
      } else {
        // Just mark as pending
        results.pending.push({
          ...update,
          suggestedPermission: permissionToAdd
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error applying policy updates:', error);
    return { error: 'Update application failed', details: error.message };
  }
};