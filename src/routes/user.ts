import express from 'express';
import { Secret } from 'jsonwebtoken';
import {
  deleteUser,
  loginUser,
  logoutUser,
  logoutUserEverywhereElse,
  refreshUserToken,
  getUserInfo,
  signupUser,
  updateUser,
  verifyUserEmail,
  sendNewUserEmailVerificationEmail,
  sendPasswordResetEmail,
  setNewPassword,
  confirmEmail
} from '../controllers/user';
import { authenticateToken } from '../middleware/authenticateToken';

export const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET!;

export const userRouter = express.Router();

userRouter.post('/signup', signupUser);
userRouter.post('/login', loginUser);
userRouter.post('/refreshtoken', refreshUserToken);
userRouter.get('/getinfo', authenticateToken, getUserInfo);
userRouter.patch('/update', authenticateToken, updateUser);
userRouter.post('/delete', authenticateToken, deleteUser);
userRouter.post('/logout', authenticateToken, logoutUser);
userRouter.post(
  '/logouteverywhereelse',
  authenticateToken,
  logoutUserEverywhereElse
);
userRouter.post('/verifyemail', verifyUserEmail);
userRouter.post('/newverificationemail', sendNewUserEmailVerificationEmail);
userRouter.post('/getpasswordreset', sendPasswordResetEmail);
userRouter.post('/setnewpassword', setNewPassword);
userRouter.post('/confirmemail', confirmEmail);
