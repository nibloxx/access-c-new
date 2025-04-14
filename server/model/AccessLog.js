import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  granted: {
    type: Boolean,
    required: true
  },
  contextData: {
    time: Date,
    device: String,
    ipAddress: String,
    location: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AccessLog = mongoose.model('AccessLog', accessLogSchema);

export default AccessLog;