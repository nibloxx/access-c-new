

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Basic Info
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  nickName: { 
    type: String, 
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    // match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  telephone: {
    type: String,
    // validate: {
    //   validator: function(v) {
    //     return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(v);
    //   },
    //   message: props => `${props.value} is not a valid phone number!`
    // }
  },

  // Access Control
  role: {
    type: String,
    enum: ["Admin", "Manager", "Member"],
    required: true,
    default: "Member"
  },
  appIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  manager: {
    type: String,
    enum: ["none", "pending", "approved"],
    default: "none"
  },
  ipWhitelist: [{
    type: String,
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Please enter valid IP addresses']
  }],

  // Status Tracking
  status: {
    type: String,
    enum: ["Online", "Offline", "Away", "DoNotDisturb"],
    default: "Offline"
  },
  lastLoginLocation: String,
  devices: [{
    deviceId: String,
    deviceType: {
      type: String,
      enum: ["Mobile", "Desktop", "Tablet", "Other"]
    },
    lastAccessed: Date
  }],

  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActiveAt: Date
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true }, // Include virtuals when converted to JSON
  toObject: { virtuals: true }
});

// Indexes for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'devices.deviceId': 1 });

// Virtual for formatted profile
userSchema.virtual('profile').get(function() {
  return {
    username: this.username,
    nickName: this.nickName,
    role: this.role,
    status: this.status
  };
});

const User = mongoose.model("users", userSchema);

export default User;