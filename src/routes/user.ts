import express from 'express';
import { deleteUser, getUserInfo, updateUser } from '../controllers/user/user';
import { authenticateToken } from '../middleware/authenticateToken';

export const userRouter = express.Router();

userRouter.get('/getinfo', authenticateToken, getUserInfo);
userRouter.patch('/update', authenticateToken, updateUser);
userRouter.post('/delete', authenticateToken, deleteUser);
