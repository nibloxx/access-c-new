import Booking from "../model/bookingModel.js";
import User from "../model/userModel.js";

const getAllCoach = async (req, res) => {
  try {
    const query = {
      role: "coach",
    };
    const coachs = await User.find(query);

    res.status(200).json({
      status: "success",
      coachs,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const getSingleCoach = async (req, res) => {
  try {
    const { id } = req.params;

    const coach = await User.findOne({ _id: id }).select("-password");
    res.status(200).json({
      status: "success",
      coach,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const getTodaysBookings = async (req, res) => {
  try {
    const { date, coachEmail } = req.body;
    if (!date || !coachEmail) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }
    const query = {
      // date,
      coachEmail,
    };
    const result = await Booking.find(query);

    res.json({
      status: "success",
      bookings: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const deleteACoach = async (req, res) => {
  try {
    const { email } = req.query;
    const result = await User.deleteOne(email);
    res.json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

export { getAllCoach, getSingleCoach, getTodaysBookings, deleteACoach };
