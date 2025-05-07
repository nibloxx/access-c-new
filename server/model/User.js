// server/model/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLE_LIST } from '../utils/constrants.js';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  roles: [
    {
      type: String,
      enum: ROLE_LIST,
      default: "DEVELOPER",
    },
  ],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  isAdmin: { type: Boolean, default: false },
  lastLogin: Date,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  phone: String,
  dateOfBirth: Date,
  contextData: {
    lastKnownLocation: String,
    lastDevice: String,
    loginHistory: [
      {
        timestamp: Date,
        ipAddress: String,
        device: String,
        location: String,
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
