// Define all available permissions in the system

const RESOURCE_TYPES = {
  USER: 'user',
  TEAM: 'team',
  ROLE: 'role',
  PROJECT: 'project',
  DASHBOARD: 'dashboard'
};

const ACTION_TYPES = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
};

// Base permissions for each resource
const generateResourcePermissions = (resource) => ({
  [`${resource}_view`]: `Can view ${resource}s`,
  [`${resource}_create`]: `Can create new ${resource}s`,
  [`${resource}_update`]: `Can update existing ${resource}s`,
  [`${resource}_delete`]: `Can delete ${resource}s`,
  [`${resource}_manage`]: `Full control over ${resource}s`
});

// Generate all permissions
const PERMISSIONS = {
  // User permissions
  ...generateResourcePermissions(RESOURCE_TYPES.USER),
  'user_view_self': 'Can view own user profile',
  'user_update_self': 'Can update own user profile',

  // Team permissions
  ...generateResourcePermissions(RESOURCE_TYPES.TEAM),
  'team_join': 'Can join teams',
  'team_leave': 'Can leave teams',
  'team_manage_members': 'Can manage team members',

  // Role permissions
  ...generateResourcePermissions(RESOURCE_TYPES.ROLE),
  'role_assign': 'Can assign roles to users',
  'role_revoke': 'Can revoke roles from users',

  // Project permissions
  ...generateResourcePermissions(RESOURCE_TYPES.PROJECT),
  'project_phase_update': 'Can update project phases',
  'project_team_assign': 'Can assign teams to projects',

  // Dashboard permissions
  ...generateResourcePermissions(RESOURCE_TYPES.DASHBOARD),
  'dashboard_view_stats': 'Can view dashboard statistics',
  'dashboard_view_logs': 'Can view access logs',
  'dashboard_view_analytics': 'Can view analytics',
  'dashboard_export': 'Can export dashboard data',

  // Admin permissions
  'admin_access': 'Full administrative access',
  'context_override': 'Can override contextual access restrictions'
};

// Default role configurations
const ROLE_CONFIGS = {
  admin: {
    name: 'Administrator',
    permissions: ['admin_access', 'context_override'],
    description: 'Full system access'
  },
  manager: {
    name: 'Manager',
    permissions: [
      'user_view', 'user_update',
      'team_manage', 'team_manage_members',
      'project_manage', 'project_phase_update',
      'dashboard_view_stats', 'dashboard_view_analytics'
    ],
    description: 'Team and project management'
  },
  user: {
    name: 'Standard User',
    permissions: [
      'user_view_self', 'user_update_self',
      'team_view', 'team_join', 'team_leave',
      'project_view',
      'dashboard_view_stats'
    ],
    description: 'Standard user access'
  }
};

// Context-based permission rules
const CONTEXT_RULES = {
  workingHours: {
    start: 9, // 9 AM
    end: 18, // 6 PM
    override_permissions: ['admin_access', 'context_override']
  },
  location: {
    restricted: ['admin_access'],
    override_permissions: ['context_override']
  },
  device: {
    mobile: {
      restricted: ['user_delete', 'team_delete', 'project_delete'],
      override_permissions: ['admin_access']
    }
  }
};

module.exports = {
  PERMISSIONS,
  ROLE_CONFIGS,
  CONTEXT_RULES,
  RESOURCE_TYPES,
  ACTION_TYPES
};