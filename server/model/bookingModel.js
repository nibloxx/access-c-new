import mongoose from "mongoose";

const bookingSchema = mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  coachEmail: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  coach: {
    type: Object,
    required: true,
  },
});

const Booking = mongoose.model("bookings", bookingSchema);

export default Booking;
