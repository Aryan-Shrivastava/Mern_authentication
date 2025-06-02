import express from 'express'
import { isLoggedIn, login, logout, register, resetPass, sendOtpVerification, sendPasswordResetOtp, verifyEmail } from '../controllers/authControl.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

// Import the auth controller
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth, sendOtpVerification);
authRouter.post('/verify-account',userAuth, verifyEmail);
authRouter.post('/is-logged-in',userAuth, isLoggedIn);
authRouter.post('/send-reset-otp', sendPasswordResetOtp);
authRouter.post('/reset-password', resetPass);



export default authRouter;
