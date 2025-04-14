import mongoose from "mongoose";

const feedBackSchema = mongoose.Schema({
  userName: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  coachEmail: {
    type: String,
  },
  comment: {
    type: String,
  },
});

const FeedBack = mongoose.model("feedbacks", feedBackSchema);

export default FeedBack;
