import Application from "../model/applicationModel.js";
import User from "../model/userModel.js";
import getUserByEmail from "../utils/getUserByEmail.js";

const confirmCoachApplication = async (req, res) => {
  try {
    const { gender, hight, age, workTime, phone, email } = req.body;
    console.log(req.body);

    if (!gender || !hight || !age || !workTime || !phone || !email) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    // get user
    const user = await getUserByEmail(email);

    // alert data
    const alertData = {
      status: true,
      res: "congratulation",
      message: "Your coach application successfully accepted by admin",
    };

    // updat data
    user.gender = gender;
    user.phone = phone;
    user.hight = hight;
    user.age = age;
    user.workTime = workTime;
    user.role = "coach";

    // query
    const query = {
      email,
    };
    const result = await User.updateOne(query, { $set: user });
    const deleteApplication = await Application.deleteOne(query);

    res.status(200).json({
      status: "success",
      message: "coach appliaction successfully accepted",
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};
const rejectCoachApplication = async (req, res) => {
  try {
    const { gender, hight, age, workTime, phone, email } = req.body;
    console.log(req.body);

    if (!email) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    // get user
    const user = await getUserByEmail(email);

    // alert data
    const alertData = {
      status: true,
      res: "Sorry",
      message: "Your coach application decline by admin",
    };

    // updat data
    user.alert = alertData;

    console.log(user);

    // query
    const query = {
      email,
    };
    const result = await User.updateOne(query, { $set: user });
    const deleteApplication = await Application.deleteOne(query);

    res.status(200).json({
      status: "success",
      message: "coach appliaction successfully decline",
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const getAllCoachApplication = async (req, res) => {
  try {
    const applications = await Application.find({});

    res.status(200).json({
      status: "success",
      applications,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

export {
  confirmCoachApplication,
  rejectCoachApplication,
  getAllCoachApplication,
};
