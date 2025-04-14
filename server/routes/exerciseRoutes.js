import express from "express";
import { addExercise } from "../controller/exerciseController.js";

const exerciseRouter = express.Router();

exerciseRouter.post("/add", addExercise);




export default exerciseRouter;
