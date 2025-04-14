import expres from "express";
import {
  deleteACoach,
  getAllCoach,
  getSingleCoach,
  getTodaysBookings,
} from "../controller/coachController.js";
const coachRouter = expres.Router();

coachRouter.post("/allBookings", getTodaysBookings);

coachRouter.get("/allCoach", getAllCoach);
coachRouter.get("/singleCoach/:id", getSingleCoach);

coachRouter.delete("/delete", deleteACoach);

export default coachRouter;
