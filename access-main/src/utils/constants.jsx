


export const ROLES = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    DEVELOPER: "Developer"
};


export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        VERIFY: '/api/auth/verify'
    },
    USERS: {
        BASE: '/api/users',
        BY_ID: (id) => `/api/users/${id}`,
        ROLES: (id) => `/api/users/${id}/roles`,
        TEAMS: (id) => `/api/users/${id}/teams`
    },
    TEAMS: {
        BASE: '/api/teams',
        BY_ID: (id) => `/api/teams/${id}`,
        MEMBERS: (id) => `/api/teams/${id}/members`
    },
    PROJECTS: {
        BASE: '/api/projects',
        BY_ID: (id) => `/api/projects/${id}`,
        PHASES: (id) => `/api/projects/${id}/phases`
    }
};

export const PERMISSIONS = {
    USER_MANAGEMENT: {
        CREATE: 'user:create',
        READ: 'user:read',
        UPDATE: 'user:update',
        DELETE: 'user:delete'
    },
    TEAM_MANAGEMENT: {
        CREATE: 'team:create',
        READ: 'team:read',
        UPDATE: 'team:update',
        DELETE: 'team:delete'
    },
    PROJECT_MANAGEMENT: {
        CREATE: 'project:create',
        READ: 'project:read',
        UPDATE: 'project:update',
        DELETE: 'project:delete',
        CHANGE_PHASE: 'project:change_phase'
    }
};

export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_CREDENTIALS: 'Invalid username or password',
        SESSION_EXPIRED: 'Your session has expired. Please login again',
        UNAUTHORIZED: 'You are not authorized to perform this action'
    },
    USER: {
        NOT_FOUND: 'User not found',
        ALREADY_EXISTS: 'User already exists',
        INVALID_ROLE: 'Invalid role assignment'
    },
    TEAM: {
        NOT_FOUND: 'Team not found',
        MEMBER_EXISTS: 'User is already a team member'
    }
};

export const VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 8,
        PATTERN: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        MESSAGE: 'Password must be at least 8 characters long and contain letters, numbers, and special characters'
    },
    USERNAME: {
        MIN_LENGTH: 3,
        PATTERN: /^[a-zA-Z0-9_-]{3,20}$/,
        MESSAGE: 'Username must be 3-20 characters long and can contain letters, numbers, underscores, and hyphens'
    }
};


export const RESOURCE_TYPES = {
    DOCUMENT: 'DOCUMENT',
    APPLICATION: 'APPLICATION',
    DATABASE: 'DATABASE',
    API: 'API',
    SERVICE: 'SERVICE'
  };
  
  export const ACCESS_LEVELS = {
    READ: 'READ',
    WRITE: 'WRITE',
    ADMIN: 'ADMIN',
    NONE: 'NONE'
  };


  export const PROJECT_PHASES = {
  PLANNING: 'planning',
  EXECUTION: 'execution',
  REVIEW: 'review',
  CLOSED: 'closed'
};

export const PHASE_PERMISSIONS = {
    [PROJECT_PHASES.PLANNING]: {
      canEdit: ['SuperAdmin', 'Admin', 'Manager'],
      canCreate: ['SuperAdmin', 'Admin', 'Manager'],
      canEditTeams: ['SuperAdmin', 'Admin', 'Manager']
    },
    [PROJECT_PHASES.EXECUTION]: {
      canEdit: ['SuperAdmin', 'Admin'],
      canManageResources: ['SuperAdmin', 'Admin', 'Manager']
    },
    [PROJECT_PHASES.REVIEW]: {
      canEdit: ['SuperAdmin', 'Admin'],
      requiresWarning: true
    },
    [PROJECT_PHASES.CLOSED]: {
      canView: ['SuperAdmin', 'Admin', 'Manager', 'Developer']
    }
  };