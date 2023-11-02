import express from 'express';
import {
  loginUser,
  logoutUser,
  logoutUserEverywhereElse,
  refreshUserToken,
  signupUser,
  verifyUserEmail,
  sendNewUserEmailVerificationEmail,
  sendPasswordResetEmail,
  setNewPassword,
  confirmEmail
} from '../controllers/auth/auth';
import { authenticateToken } from '../middleware/authenticateToken';

export const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', loginUser);
authRouter.post('/refreshtoken', refreshUserToken);
authRouter.post('/logout', authenticateToken, logoutUser);
authRouter.post(
  '/logouteverywhereelse',
  authenticateToken,
  logoutUserEverywhereElse
);
authRouter.post('/verifyemail', verifyUserEmail);
authRouter.post('/newverificationemail', sendNewUserEmailVerificationEmail);
authRouter.post('/getpasswordreset', sendPasswordResetEmail);
authRouter.post('/setnewpassword', setNewPassword);
authRouter.post('/confirmemail', confirmEmail);
