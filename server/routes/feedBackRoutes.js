import express from "express";
import {
  createAFeedBack,
  getFeedBackForCoach,
} from "../controller/feedBackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/create", createAFeedBack);
feedbackRouter.get("/all", getFeedBackForCoach);

export default feedbackRouter;
