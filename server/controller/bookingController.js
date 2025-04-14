import Booking from "../model/bookingModel.js";
import User from "../model/userModel.js";

const createABooking = async (req, res) => {
  try {
    const { date, coachId, time, userEmail } = req.body;

    // coach
    const coach = await User.findOne({ _id: coachId }).select([
      "-password",
      "-role",
      "-alert",
    ]);

    const bookingData = {
      date,
      coachEmail: coach.email,
      time,
      coach,
      userEmail,
    };

    // booking
    const booking = new Booking(bookingData);
    const result = await booking.save();

    res.status(200).json({
      status: "success",
      message: "booking created successfully",
      coach,
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { time, _id } = req.body;

    const booking = await Booking.findOne({ _id });
    const OldTime = booking.time;
    booking.time = time;

    const result = await Booking.updateOne({ _id }, { $set: booking });

    res.status(200).json({
      status: "success",
      message: "booking update successfully",
      result,
      booking,
      OldTime,
      time,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await Booking.deleteOne({ _id: id });
    res.json({
      status: "success",
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

export { createABooking, updateBooking, deleteBooking };
