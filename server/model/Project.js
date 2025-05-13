import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    trim: true
  },
  currentPhase: {
    type: String,
    enum: ['planning', 'execution', 'review', 'closed'],
    default: 'planning'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  phaseHistory: [{
    phase: String,
    startDate: Date,
    endDate: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  phasePermissions: {
    planning: {
      canEditRoles: ['admin', 'teamLead'],
      canViewDocuments: ['admin', 'teamLead', 'member'],
      canEditModels: ['admin', 'teamLead', 'engineer']
    },
    execution: {
      canEditRoles: ['admin'],
      canViewDocuments: ['admin', 'teamLead', 'member'],
      canEditModels: ['admin', 'teamLead']
    },
    review: {
      canEditRoles: ['admin'],
      canViewDocuments: ['admin', 'teamLead', 'member', 'contractor'],
      canEditModels: ['admin']
    },
    closed: {
      canEditRoles: ['admin'],
      canViewDocuments: ['admin', 'teamLead'],
      canEditModels: ['admin']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add middleware to update updatedAt
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Project', projectSchema);