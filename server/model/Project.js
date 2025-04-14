import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  currentPhase: {
    type: String,
    enum: ['planning', 'execution', 'review', 'completed'],
    default: 'planning'
  },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  phaseHistory: [{
    phase: String,
    startDate: Date,
    endDate: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;