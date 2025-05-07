import User from "../model/User.js";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/logger.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Find user by username
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Update last login and context data
    user.lastLogin = new Date();
    user.contextData.lastDevice = req.headers["user-agent"];
    user.contextData.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      device: req.headers["user-agent"],
      location: "Unknown"
    });
    await user.save();

    // Log activity
    logActivity("login", user._id, true, {
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        roles: user.roles,
        address: user.address,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.json({ message: "Already logged out" });
  }
};
