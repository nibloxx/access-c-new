export const PHASE_PERMISSIONS = {
  planning: {
    canEdit: ['Admin', 'Manager'],
    canCreate: ['Admin', 'Manager'],
    canEditTeams: ['Admin', 'Manager']
  },
  execution: {
    canEdit: ['Admin'],
    canManageResources: ['Admin', 'Manager']
  },
  review: {
    canEdit: ['Admin'],
    requiresWarning: true
  },
  closed: {
    canView: ['Admin', 'Manager', 'Developer']
  }
};

export const checkPhasePermission = (user, phase, permissionType) => {
  if (!phase || !user || !user.roles) return false;
  
  const permissions = PHASE_PERMISSIONS[phase];
  if (!permissions || !permissions[permissionType]) return false;

  return user.roles.some(role => 
    permissions[permissionType].includes(role)
  );
}; 