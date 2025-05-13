import Team from '../model/Team.js';
import User from '../model/User.js';
import { logActivity } from '../utils/logger.js';
import Project from '../model/Project.js';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'username email firstName lastName')
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
      .populate('projects', 'name currentPhase');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new team
export const createTeam = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ 
        message: 'Team name must be at least 3 characters long' 
      });
    }

    const team = new Team({
      name,
      description,
      members: members || []
    });

    await team.save();

    logActivity('createTeam', req.user.id, true, {
      teamId: team._id,
      teamName: name
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (name) team.name = name;
    if (description) team.description = description;

    if (members) {
      // Validate members
      const validUsers = await User.find({ _id: { $in: members.map(m => m.user) } });
      if (validUsers.length !== members.length) {
        return res.status(400).json({ message: 'One or more invalid user IDs provided' });
      }

      team.members = members;
    }

    await team.save();

    logActivity('updateTeam', req.user.id, true, {
      teamId: id,
      teamName: team.name
    });

    res.json({
      message: 'Team updated successfully',
      team
    });
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

    // Remove team references from projects
    await Project.updateMany(
      { teams: id },
      { $pull: { teams: id } }
    );

    await Team.findByIdAndDelete(id);

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

// Get teams for a project
export const getProjectTeams = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const teams = await Team.find({ projects: projectId })
      .populate('members.user', 'username email firstName lastName');
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching project teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};