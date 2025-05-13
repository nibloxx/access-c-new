import Project from '../model/Project.js';
import Team from '../model/Team.js';
import { logActivity } from '../utils/logger.js';
import { checkPhasePermission } from '../utils/permissions.js';

// Validate phase transition
const isValidPhaseTransition = (currentPhase, newPhase) => {
  const phaseOrder = ['planning', 'execution', 'review', 'closed'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const newIndex = phaseOrder.indexOf(newPhase);
  return newIndex > currentIndex;
};

// Add at the top of the file
const validateProjectUpdate = (data) => {
  const errors = [];
  
  if (data.name && data.name.length < 3) {
    errors.push('Project name must be at least 3 characters long');
  }
  
  if (data.currentPhase && !['planning', 'execution', 'review', 'closed'].includes(data.currentPhase)) {
    errors.push('Invalid phase');
  }
  
  if (data.teams && !Array.isArray(data.teams)) {
    errors.push('Teams must be an array');
  }
  
  return errors;
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('teams', 'name')
      .populate('phaseHistory.modifiedBy', 'username');

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project with phase validation
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate update data
    const validationErrors = validateProjectUpdate(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Add logging to debug
    console.log('Update Project Request:', {
      id,
      body: req.body,
      user: req.user
    });

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Phase transition validation
    if (updateData.currentPhase && updateData.currentPhase !== project.currentPhase) {
      const phases = ['planning', 'execution', 'review', 'closed'];
      const currentIndex = phases.indexOf(project.currentPhase);
      const newIndex = phases.indexOf(updateData.currentPhase);

      if (newIndex <= currentIndex) {
        return res.status(400).json({ 
          message: `Invalid phase transition from ${project.currentPhase} to ${updateData.currentPhase}`
        });
      }

      // Update phase history
      const currentPhaseRecord = project.phaseHistory.find(
        ph => ph.phase === project.currentPhase && !ph.endDate
      );
      
      if (currentPhaseRecord) {
        currentPhaseRecord.endDate = new Date();
      }

      project.phaseHistory.push({
        phase: updateData.currentPhase,
        startDate: new Date(),
        modifiedBy: req.user.id
      });

      project.currentPhase = updateData.currentPhase;
    }

    // Update basic info
    if (updateData.name) project.name = updateData.name;
    if (updateData.description) project.description = updateData.description;

    // Handle team updates
    if (updateData.teams) {
      // Validate teams array
      if (!Array.isArray(updateData.teams)) {
        return res.status(400).json({ 
          message: 'Teams must be an array' 
        });
      }

      const validTeams = await Team.find({ _id: { $in: updateData.teams } });
      if (validTeams.length !== updateData.teams.length) {
        return res.status(400).json({ 
          message: 'One or more invalid team IDs provided' 
        });
      }

      // Update team references
      await Team.updateMany(
        { _id: { $in: project.teams } },
        { $pull: { projects: project._id } }
      );

      await Team.updateMany(
        { _id: { $in: updateData.teams } },
        { $addToSet: { projects: project._id } }
      );

      project.teams = updateData.teams;
    }

    // Save the project
    await project.save();

    // Log successful update
    console.log('Project updated successfully:', {
      projectId: project._id,
      updates: {
        name: updateData.name ? 'updated' : 'unchanged',
        description: updateData.description ? 'updated' : 'unchanged',
        teams: updateData.teams ? 'updated' : 'unchanged',
        phase: updateData.currentPhase ? 'updated' : 'unchanged'
      }
    });

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      message: 'Error updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

// Create project
export const createProject = async (req, res) => {
  try {
    const { name, description, teams } = req.body;

    // Validate required fields
    if (!name || name.length < 3) {
      return res.status(400).json({ 
        message: 'Project name must be at least 3 characters long' 
      });
    }

    // Create project
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
    if (teams?.length > 0) {
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
    const project = req.project; // Set by middleware

    // Remove project references from teams
    await Team.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );

    await Project.findByIdAndDelete(project._id);

    logActivity('deleteProject', req.user.id, true, {
      projectId: project._id,
      projectName: project.name
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};