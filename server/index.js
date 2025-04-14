import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import colors from "colors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import applicationRouter from "./routes/applicationRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import coachRouter from "./routes/coachRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";
import feedbackRouter from "./routes/feedBackRoutes.js";
// import {chatingRouter} from "./routes/chatRoutes.js";
// import {exerciseRouter} from "./routes/exerciseRoutes.js";

// APP
const app = express();

// CONFIG
dotenv.config();

//MIDDLEWIRES
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ROUTES
app.use("/api/v1/user", userRouter);
app.use("/api/v1/trainer", applicationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/coach", coachRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/feedback", feedbackRouter);
// app.use("/api/v1/chat", chatingRouter);
// app.use("/api/v1/exercise", exerciseRouter);

// HOMEPAGE
app.get("/", (req, res) => {
  res.send(`<h1>Wellcome to Gym server Homepage</h1>`);
});

// LISTEN
const port = process.env.PORT || 8080;
connectDB();
app.listen(port, () => {
  console.log(`server is running on port ${port}`.cyan.bold);
});
