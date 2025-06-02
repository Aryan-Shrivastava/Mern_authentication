import bycrypt, { hash } from 'bcryptjs';
import JWT from 'jsonwebtoken';
import userModel from '../Models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashpass = await bycrypt.hash(password, 10);

        const newUser = new userModel({ name, email, password: hashpass });
        await newUser.save();

        const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Sending the emails
        const mail = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Aryan's MERN Auth",
            text: `Hello ${name},\n\nWelcome to Aryan's MERN Auth! Your registered email id is ${email}. We're excited to have you on board.\n\nBest regards,\nThe Team`,
        }
        await transporter.sendMail(mail);

        return res.json({ success: true, message: "User registered successfully" });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and Password, both are required" });
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isValid = await bycrypt.compare(password, user.password);
        if (!isValid) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({ success: true, message: "User logged in successfully" });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : 'strict',
        });
        return res.json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const sendOtpVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (user.isVerified) {
            return res.json({ success: false, message: "User already verified" });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Welcome ${user.name},\n\nYour OTP for account verification is ${otp}. It is valid for 5 minutes.\n\nBest regards,\nThe Team`,
        };
        await transporter.sendMail(mail);

        return res.json({ success: true, message: "OTP sent to your email", userId: user._id });


    } catch (error) {
        return res.json({ success: false, message: error.message });

    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "User ID and OTP are required" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpiry < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        user.isVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiry = 0;
        await user.save();
        return res.json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isLoggedIn = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is logged in", userId: req.body.userId });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Send password reset OTP
export const sendPasswordResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        await user.save();

        const mail = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Welcome ${user.name},\n\nYour OTP for password reset is ${otp}. It is valid for 5 minutes.\n\nBest regards,\nThe Team`,
        };
        await transporter.sendMail(mail);
        return res.json({ success: true, message: "OTP sent to your email" });


    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// reset user password
export const resetPass = async (req, res ) =>{
    const {email, otp, password} = req.body;
    if (!email || !otp || !password) {
        return res.json({ success: false, message: "Email, OTP and Password are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if(user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if( user.resetOtpExpiry < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        const hashpass = await bycrypt.hash(password, 10);
        user.password = hashpass;
        user.resetOtp = "";
        user.resetOtpExpiry = 0;
        await user.save();
        return res.json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
