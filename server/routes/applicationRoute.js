import express from "express";
import { createACoachApplication } from "../controller/applicationController.js";

const applicationRouter = express.Router();

applicationRouter.post("/createApplication", createACoachApplication);

export default applicationRouter;
