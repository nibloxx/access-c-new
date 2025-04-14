import AccessLog from '../model/AccessLog.js';

// Activity logger
export const logActivity = async (action, userId, granted, contextData = {}) => {
  try {
    const log = new AccessLog({
      user: userId,
      action,
      resource: contextData.resource || action,
      granted,
      contextData: {
        ...contextData,
        time: new Date(),
        ipAddress: contextData.ipAddress || 'unknown'
      }
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};