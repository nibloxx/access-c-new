import User from '../model/User.js';
import Team from '../model/Team.js';
import Role from '../model/Role.js';
import { logActivity } from '../utils/logger.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('roles', 'name')
      .populate('teams', 'name');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('roles', 'name permissions')
      .populate({
        path: 'teams',
        populate: {
          path: 'projects',
          model: 'Project'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (Use Case 1: Admin Requests to Add User)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roles, teams, isAdmin } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      roles,
      teams,
      isAdmin: isAdmin || false
    });
    
    await user.save();
    
    // Add user to specified teams
    if (teams && teams.length) {
      await Promise.all(teams.map(async (teamId) => {
        const team = await Team.findById(teamId);
        if (team) {
          team.members.push({ user: user._id, role: roles[0] });
          await team.save();
        }
      }));
    }
    
    // Log activity
    logActivity('createUser', req.user.id, true, {
      targetUser: user._id,
      teams,
      roles
    });
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update existing user (Use Case 2: Admin Updates User)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, roles, teams, isAdmin } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (roles) user.roles = roles;
    
    // Handle team updates
    if (teams) {
      // Remove user from teams they're no longer part of
      const oldTeams = user.teams;
      const teamsToRemove = oldTeams.filter(team => !teams.includes(team.toString()));
      
      await Promise.all(teamsToRemove.map(async (teamId) => {
        const team = await Team.findById(teamId);
        if (team) {
          team.members = team.members.filter(member => member.user.toString() !== id);
          await team.save();
        }
      }));
      
      // Add user to new teams
      const teamsToAdd = teams.filter(team => !oldTeams.includes(team));
      
      await Promise.all(teamsToAdd.map(async (teamId) => {
        const team = await Team.findById(teamId);
        if (team) {
          team.members.push({ user: user._id, role: roles[0] });
          await team.save();
        }
      }));
      
      user.teams = teams;
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    // Log activity
    logActivity('updateUser', req.user.id, true, {
      targetUser: user._id,
      updatedFields: Object.keys(req.body)
    });
    
    res.json({ message: 'User updated successfully', user: { id: user._id } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Use Case 3: Admin Deletes User)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user to delete
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check dependencies before deletion
    const teams = await Team.find({ 'members.user': id });
    
    // Remove user from all teams
    await Promise.all(teams.map(async (team) => {
      team.members = team.members.filter(member => member.user.toString() !== id);
      await team.save();
    }));
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    // Log activity
    logActivity('deleteUser', req.user.id, true, {
      targetUser: id,
      teams: teams.map(team => team._id)
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};