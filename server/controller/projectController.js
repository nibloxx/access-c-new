import Project from '../model/Project.js';
import Team from '../model/Team.js';
import { logActivity } from '../utils/logger.js';

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('teams', 'name');
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'teams',
        populate: {
          path: 'members.user',
          select: 'username email firstName lastName'
        }
      });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create project
export const createProject = async (req, res) => {
  try {
    const { name, description, teams, currentPhase } = req.body;
    
    const project = new Project({
      name,
      description,
      teams: teams || [],
      currentPhase: currentPhase || 'planning',
      phaseHistory: [{ 
        phase: currentPhase || 'planning', 
        startDate: new Date(), 
        endDate: null 
      }]
    });
    
    await project.save();
    
    // Add project to teams
    if (teams && teams.length) {
      await Promise.all(teams.map(async (teamId) => {
        await Team.findByIdAndUpdate(
          teamId,
          { $addToSet: { projects: project._id } }
        );
      }));
    }
    
    // Log activity
    logActivity('createProject', req.user.id, true, {
      projectName: name,
      initialPhase: currentPhase || 'planning'
    });
    
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, teams, currentPhase } = req.body;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update basic info
    if (name) project.name = name;
    if (description) project.description = description;
    
    // Handle phase change
    if (currentPhase && currentPhase !== project.currentPhase) {
      // Close the current phase
      const currentPhaseRecord = project.phaseHistory.find(
        ph => ph.phase === project.currentPhase && !ph.endDate
      );
      
      if (currentPhaseRecord) {
        currentPhaseRecord.endDate = new Date();
      }
      
      // Add new phase
      project.phaseHistory.push({
        phase: currentPhase,
        startDate: new Date(),
        endDate: null
      });
      
      project.currentPhase = currentPhase;
      
      // Log phase change
      logActivity('changeProjectPhase', req.user.id, true, {
        projectId: id,
        oldPhase: project.currentPhase,
        newPhase: currentPhase
      });
    }
    
    // Handle team updates
    if (teams) {
      // Get current project teams
      const currentTeams = project.teams.map(t => t.toString());
      
      // Remove project from teams no longer associated
      const teamsToRemove = currentTeams.filter(teamId => !teams.includes(teamId));
      await Promise.all(teamsToRemove.map(async (teamId) => {
        await Team.findByIdAndUpdate(
          teamId,
          { $pull: { projects: project._id } }
        );
      }));
      
      // Add project to new teams
      const teamsToAdd = teams.filter(teamId => !currentTeams.includes(teamId));
      await Promise.all(teamsToAdd.map(async (teamId) => {
        await Team.findByIdAndUpdate(
          teamId,
          { $addToSet: { projects: project._id } }
        );
      }));
      
      project.teams = teams;
    }
    
    project.updatedAt = Date.now();
    await project.save();
    
    // Log activity
    logActivity('updateProject', req.user.id, true, {
      projectId: id,
      updatedFields: Object.keys(req.body)
    });
    
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Remove project reference from all teams
    await Team.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );
    
    await Project.findByIdAndDelete(id);
    
    // Log activity
    logActivity('deleteProject', req.user.id, true, {
      projectId: id,
      projectName: project.name
    });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};