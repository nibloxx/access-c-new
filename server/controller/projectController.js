import Project from '../model/Project.js';
import Team from '../model/Team.js';
import { logActivity } from '../utils/logger.js';

// Validate phase transition
const isValidPhaseTransition = (currentPhase, newPhase) => {
  const phaseOrder = ['planning', 'execution', 'review', 'closed'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const newIndex = phaseOrder.indexOf(newPhase);
  return newIndex > currentIndex;
};

// Get all projects with phase-based filtering
export const getAllProjects = async (req, res) => {
  try {
    const { phase, role } = req.query;
    let query = {};
    
    if (phase) {
      query.currentPhase = phase;
    }

    const projects = await Project.find(query)
      .populate('teams', 'name')
      .populate('phaseHistory.modifiedBy', 'username');
    
    // Filter based on user role and phase permissions
    const filteredProjects = projects.filter(project => {
      const permissions = project.phasePermissions[project.currentPhase];
      return permissions.canViewDocuments.includes(req.user.role);
    });
    
    res.json(filteredProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project with phase validation
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, teams, currentPhase } = req.body;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Phase transition validation
    if (currentPhase && currentPhase !== project.currentPhase) {
      if (!isValidPhaseTransition(project.currentPhase, currentPhase)) {
        return res.status(400).json({ 
          message: `Invalid phase transition from ${project.currentPhase} to ${currentPhase}`
        });
      }

      // Validate phase-specific requirements
      if (currentPhase === 'execution') {
        const hasTeams = project.teams && project.teams.length > 0;
        if (!hasTeams) {
          return res.status(400).json({ 
            message: 'Project must have assigned teams before moving to execution phase'
          });
        }
      }

      // Close current phase and add new phase
      const currentPhaseRecord = project.phaseHistory.find(
        ph => ph.phase === project.currentPhase && !ph.endDate
      );
      
      if (currentPhaseRecord) {
        currentPhaseRecord.endDate = new Date();
        currentPhaseRecord.modifiedBy = req.user.id;
      }
      
      project.phaseHistory.push({
        phase: currentPhase,
        startDate: new Date(),
        endDate: null,
        modifiedBy: req.user.id
      });
      
      project.currentPhase = currentPhase;
      
      // Log phase change with detailed info
      logActivity('changeProjectPhase', req.user.id, true, {
        projectId: id,
        oldPhase: project.currentPhase,
        newPhase: currentPhase,
        timestamp: new Date(),
        reason: req.body.phaseChangeReason || 'Not specified'
      });
    }
    
    // Update basic info with validation
    if (name) {
      if (name.length < 3) {
        return res.status(400).json({ message: 'Project name must be at least 3 characters long' });
      }
      project.name = name;
    }
    if (description) project.description = description;
    
    // Handle team updates with validation
    if (teams) {
      const validTeams = await Team.find({ _id: { $in: teams } });
      if (validTeams.length !== teams.length) {
        return res.status(400).json({ message: 'One or more invalid team IDs provided' });
      }

      const currentTeams = project.teams.map(t => t.toString());
      
      // Handle team removals
      const teamsToRemove = currentTeams.filter(teamId => !teams.includes(teamId));
      await Promise.all(teamsToRemove.map(async (teamId) => {
        await Team.findByIdAndUpdate(
          teamId,
          { $pull: { projects: project._id } }
        );
      }));
      
      // Handle team additions
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
    
    // Send detailed response
    res.json({
      message: 'Project updated successfully',
      project,
      updates: {
        phaseChanged: currentPhase !== undefined,
        teamsModified: teams !== undefined,
        detailsChanged: name !== undefined || description !== undefined
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: error.message
    });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teams', 'name')
      .populate('phaseHistory.modifiedBy', 'username');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to view in current phase
    const permissions = project.phasePermissions[project.currentPhase];
    if (!permissions.canViewDocuments.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for current project phase' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const { name, description, teams } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'Project name must be at least 3 characters long' });
    }

    const project = new Project({
      name,
      description,
      teams: teams || [],
      currentPhase: 'planning',
      phaseHistory: [{
        phase: 'planning',
        startDate: new Date(),
        modifiedBy: req.user.id
      }]
    });

    await project.save();

    // Update team references
    if (teams && teams.length > 0) {
      await Team.updateMany(
        { _id: { $in: teams } },
        { $addToSet: { projects: project._id } }
      );
    }

    logActivity('createProject', req.user.id, true, {
      projectId: project._id,
      projectName: name
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project models
export const updateProjectModels = async (req, res) => {
  try {
    const { id } = req.params;
    const { models } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate models data structure
    if (!Array.isArray(models)) {
      return res.status(400).json({ message: 'Models must be an array' });
    }

    // Update project models
    project.models = models;
    project.updatedAt = Date.now();
    await project.save();

    logActivity('updateProjectModels', req.user.id, true, {
      projectId: id,
      modelsUpdated: models.length
    });

    res.json({
      message: 'Project models updated successfully',
      project
    });
  } catch (error) {
    console.error('Error updating project models:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get project documents
export const getProjectDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('documents');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project.documents || []);
  } catch (error) {
    console.error('Error fetching project documents:', error);
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

    // Remove project references from teams
    await Team.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );

    await Project.findByIdAndDelete(id);

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