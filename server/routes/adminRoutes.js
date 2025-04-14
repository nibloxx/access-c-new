import express from "express";
import {
  confirmCoachApplication,
  getAllCoachApplication,
  rejectCoachApplication,
} from "../controller/AdminController.js";

const adminRouter = express.Router();

adminRouter.post("/confirm", confirmCoachApplication);
adminRouter.post("/reject", rejectCoachApplication);

adminRouter.get("/allApplications", getAllCoachApplication);

export default adminRouter;
