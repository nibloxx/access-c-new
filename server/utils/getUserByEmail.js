import User from "../model/userModel.js";

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email: email });

  return user;
};

export default getUserByEmail;
