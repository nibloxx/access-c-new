import mongoose from "mongoose";

const applicationSchema = mongoose.Schema({
  firstName: {
    type: String,
    minLength: [3, "First name is too short"],
    maxLength: [20, "Name too large"],
    trim: true,
    default: "First name",
  },
  lastName: {
    type: String,
    minLength: [3, "Last name is too short"],
    maxLength: [20, "Name too large"],
    trim: true,
    default: "Last name",
  },
  email: {
    type: String,
  },
  gender: {
    type: String,
  },
  age: {
    type: String,
  },
  phone: {
    type: String,
  },
  workTime: {
    type: Array,
  },
  photo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
  },
  hight: {
    type: String,
    required: [true, "provide your hight"],
  },
  status: {
    type: String,
    default: "pending",
  },
});

const Application = mongoose.model("applications", applicationSchema);

export default Application;
