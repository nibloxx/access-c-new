import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import generateToken from "../utils/token.js";




// // USER LOGIN
 export const userLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // GET  CREDENTIALS
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    // FIND USER
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        error: "No user found",
      });
    }

    // CHECK PASSWORD
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        status: "fail",
        error: "wrong password",
      });
    }

    // GENERATE TOKEN
    const token = generateToken(user);

    // CLIENT DATA
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      status: "success",
      message: "User sign in successfully",
      data: {
        userData,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

// // Create User
//  const createUser = async (req, res) => {
//   try {

//     const user = new User(req.body);
//     await user.save();
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get All Users
//  const getUsers = async (req, res) => {
//   try {
//     const users = await User.find().populate('team');
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update User
//  const updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Delete User
//  const deleteUser = async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'User deleted' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// export {
//   userLogIn,
//   createUser,
//   getUsers,
//   updateUser,
//   deleteUser
// }



// Utility function for IP validation
// const isValidIP = (ip) => {
//   return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
// };

// @desc    Create new user
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    // Validate IP whitelist
    // if (req.body.ipWhitelist) {
    //   const invalidIPs = req.body.ipWhitelist.filter(ip => !isValidIP(ip));
    //   if (invalidIPs.length > 0) {
    //     return res.status(400).json({ 
    //       error: `Invalid IP addresses: ${invalidIPs.join(', ')}`
    //     });
    //   }
    // }

    const user = new User({
      ...req.body,
      // Ensure default values
      status: 'Offline',
      manager: req.body.manager || 'none'
    });

    await user.save();
    
    // Return user without sensitive data
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      devices: user.devices,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      details: err.errors ? Object.values(err.errors).map(e => e.message) : []
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-__v -ipWhitelist')
      .lean();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
export const updateUser = async (req, res) => {
  try {
    // Prevent role escalation unless by admin
    if (req.body.role && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    // Validate devices array if updating
    if (req.body.devices) {
      const invalidDevices = req.body.devices.filter(
        d => !d.deviceId || !d.deviceType
      );
      if (invalidDevices.length > 0) {
        return res.status(400).json({ 
          error: 'Devices must have deviceId and deviceType'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors ? Object.values(err.errors).map(e => e.message) : []
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedId: user._id 
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
};

// @desc    Add device to user
// @route   POST /api/users/:id/devices
export const addDevice = async (req, res) => {
  try {
    const { deviceId, deviceType } = req.body;
    
    if (!deviceId || !deviceType) {
      return res.status(400).json({ 
        error: 'deviceId and deviceType are required' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          devices: {
            deviceId,
            deviceType,
            lastAccessed: new Date()
          }
        }
      },
      { new: true }
    ).select('username devices');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastActiveAt: status === 'Online' ? new Date() : undefined
      },
      { new: true }
    ).select('username status lastActiveAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }
};