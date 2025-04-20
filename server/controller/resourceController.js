import Resource from '../model/Resource.js';
import { validateResource } from '../utils/validation.js';

// Get all resources
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('teams', 'name')
      .populate('createdBy', 'username')
      .sort('-createdAt');
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new resource
export const createResource = async (req, res) => {
  try {
    const { error } = validateResource(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const resource = new Resource({
      ...req.body,
      createdBy: req.user._id
    });

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('teams', 'name')
      .populate('createdBy', 'username');

    res.status(201).json(populatedResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update resource
export const updateResource = async (req, res) => {
  try {
    const { error } = validateResource(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      { new: true }
    )
    .populate('teams', 'name')
    .populate('createdBy', 'username');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete resource
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};