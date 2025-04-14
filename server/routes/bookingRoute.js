import express from "express";
import {
  createABooking,
  deleteBooking,
  updateBooking,
} from "../controller/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createABooking);
bookingRouter.patch("/update", updateBooking);
bookingRouter.delete("/delete/:id", deleteBooking);

export default bookingRouter;
