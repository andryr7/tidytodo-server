import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { logoutUser } from '../controllers/auth/logoutUser';
import { logoutUserEverywhereElse } from '../controllers/auth/logoutUserEverywhere';
import { verifyUserEmail } from '../controllers/auth/verifyUserEmail';
import { sendNewUserEmailVerificationEmail } from '../controllers/auth/sendNewUserEmailVerificationEmail';
import { sendPasswordResetEmail } from '../controllers/auth/sendPasswordResetEmail';
import { setNewPassword } from '../controllers/auth/setNewPassword';
import { confirmEmail } from '../controllers/auth/confirmEmail';
import { signupUser } from '../controllers/auth/signupUser';
import { loginUser } from '../controllers/auth/loginUser';
import { refreshUserToken } from '../controllers/auth/refreshUserToken';

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
