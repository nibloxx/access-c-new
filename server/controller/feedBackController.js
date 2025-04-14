import FeedBack from "../model/feedbackModel.js";
import User from "../model/userModel.js";

const createAFeedBack = async (req, res) => {
  try {
    const { userName, userEmail, coachEmail, comment } = req.body;

    const feedBackData = {
      userName,
      userEmail,
      coachEmail,
      comment,
    };
    const feedback = new FeedBack(feedBackData);
    const result = await feedback.save();

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

const getFeedBackForCoach = async (req, res) => {
  try {
    const { id } = req.query;

    const coach = await User.findOne({ _id: id });

    const query = {
      coachEmail: coach.email,
    };

    const result = await FeedBack.find(query);

    res.json({
      status: "success",
      feedbacks: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

export { createAFeedBack, getFeedBackForCoach };
