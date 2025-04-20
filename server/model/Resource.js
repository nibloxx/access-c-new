import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  type: {
    type: String,
    required: true,
    enum: ['DOCUMENT', 'APPLICATION', 'DATABASE', 'API', 'SERVICE']
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  accessLevel: {
    type: String,
    required: true,
    enum: ['READ', 'WRITE', 'ADMIN', 'NONE'],
    default: 'READ'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  contextRules: [{
    type: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Resource', resourceSchema);