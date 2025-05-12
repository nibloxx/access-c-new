export const ROLES = {
    SUPERADMIN: "SuperAdmin",
    ADMIN: "Admin",
    MANAGER: "Manager",
    DEVELOPER: "Developer"
};

export const ROLE_LIST = Object.values(ROLES);

// Define role hierarchy and permissions
const ROLE_HIERARCHY = {
  [ROLES.SUPERADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.TEAMLEAD]: 1,
  [ROLES.DEVELOPER]: 0,
  [ROLES.CONTRACTOR]: 0
};