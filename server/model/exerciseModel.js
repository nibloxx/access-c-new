import mongoose from "mongoose";

const exercisesSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  exercises: {
    type: Array,
  },
  sessionID: {
    type: String,
    required: true
  }
});

const Exercise = mongoose.model('exercise', exercisesSchema);
export default Exercise;