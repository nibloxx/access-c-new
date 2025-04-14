import express from "express";
// import { checkContext } from "../utils/helper.js";
// import { checkTeamAccess } from "../utils/middleware/auth.js";
import { createUser, getUsers, updateUser, deleteUser } from "../controller/userController.js";

const userRouter = express.Router();

// userRouter.post('/', checkContext, createUser);
// userRouter.get('/', checkTeamAccess('Admin'), getUsers);
// userRouter.patch('/:id', checkContext, updateUser);
// userRouter.delete('/:id', checkTeamAccess('Admin'), deleteUser);

userRouter.post('/', createUser);
userRouter.get('/', getUsers);
userRouter.patch('/:id', updateUser);
userRouter.delete('/:id', deleteUser);



export default userRouter;
