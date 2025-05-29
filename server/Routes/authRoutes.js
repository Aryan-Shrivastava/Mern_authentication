import express from 'express'
import { login, logout, register } from '../controllers/authControl.js';

const authRouter = express.Router();

// Import the auth controller
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);

export default authRouter;
