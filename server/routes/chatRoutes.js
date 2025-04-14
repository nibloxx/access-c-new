import express from "express";
import { chat, createChat, getChatsWith, getHistory } from "../controller/chatController";


const chatingRouter = express.Router();

chatingRouter.post("/create-chat",createChat);
chatingRouter.get("/getChatsWith/:id",getChatsWith);
chatingRouter.post("/chat",chat);
chatingRouter.get("/gethistory/:id",getHistory);


export default chatingRouter;
