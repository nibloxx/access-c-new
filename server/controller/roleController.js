import Role from '../model/Role.js';
import User from '../model/User.js';
import { logActivity } from '../utils/logger.js';

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create role
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }
    
    const role = new Role({
      name,
      description,
      permissions
    });
    
    await role.save();
    
    // Log activity
    logActivity('createRole', req.user.id, true, {
      roleName: name,
      permissions
    });
    
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (name) role.name = name;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    
    role.updatedAt = Date.now();
    await role.save();
    
    // Log activity
    logActivity('updateRole', req.user.id, true, {
      roleId: id,
      updatedFields: Object.keys(req.body)
    });
    
    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role is in use
    const usersWithRole = await User.find({ roles: id });
    if (usersWithRole.length > 0) {
      return res.status(400).json({ 
        message: 'Role cannot be deleted as it is assigned to users',
        users: usersWithRole.map(u => u.username)
      });
    }
    
    await Role.findByIdAndDelete(id);
    
    // Log activity
    logActivity('deleteRole', req.user.id, true, {
      roleId: id
    });
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};