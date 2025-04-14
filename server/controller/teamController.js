import Team from '../model/Team.js';
import User from '../model/User.js';
import { logActivity } from '../utils/logger.js';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'username email')
      .populate('members.role', 'name')
      .populate('projects', 'name currentPhase');
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'username email firstName lastName')
      .populate('members.role', 'name permissions')
      .populate('projects', 'name description currentPhase');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create team
export const createTeam = async (req, res) => {
  try {
    const { name, description, members, projects } = req.body;
    
    const team = new Team({
      name,
      description,
      members: members || [],
      projects: projects || []
    });
    
    await team.save();
    
    // Update users' teams array
    if (members && members.length) {
      await Promise.all(members.map(async (member) => {
        await User.findByIdAndUpdate(
          member.user,
          { $addToSet: { teams: team._id } }
        );
      }));
    }
    
    // Log activity
    logActivity('createTeam', req.user.id, true, {
      teamName: name,
      memberCount: members?.length || 0
    });
    
    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members, projects } = req.body;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Update basic info
    if (name) team.name = name;
    if (description) team.description = description;
    if (projects) team.projects = projects;
    
    // Handle member updates
    if (members) {
      // Get current team members
      const currentMembers = team.members.map(m => m.user.toString());
      
      // Identify members to remove
      const newMemberIds = members.map(m => m.user.toString());
      const membersToRemove = currentMembers.filter(id => !newMemberIds.includes(id));
      
      // Remove team from users no longer in the team
      await Promise.all(membersToRemove.map(async (userId) => {
        await User.findByIdAndUpdate(
          userId,
          { $pull: { teams: team._id } }
        );
      }));
      
      // Add team to new users
      const existingMemberIds = currentMembers;
      const membersToAdd = members.filter(m => !existingMemberIds.includes(m.user.toString()));
      
      await Promise.all(membersToAdd.map(async (member) => {
        await User.findByIdAndUpdate(
          member.user,
          { $addToSet: { teams: team._id } }
        );
      }));
      
      team.members = members;
    }
    
    team.updatedAt = Date.now();
    await team.save();
    
    // Log activity
    logActivity('updateTeam', req.user.id, true, {
      teamId: id,
      updatedFields: Object.keys(req.body)
    });
    
    res.json({ message: 'Team updated successfully', team });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Remove team reference from all users
    const memberIds = team.members.map(member => member.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { teams: id } }
    );
    
    await Team.findByIdAndDelete(id);
    
    // Log activity
    logActivity('deleteTeam', req.user.id, true, {
      teamId: id,
      teamName: team.name
    });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};