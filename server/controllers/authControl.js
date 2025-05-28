import bycrypt, { hash } from 'bcryptjs';
import JWT from 'jsonwebtoken';
import userModel from '../Models/userModel.js';

export const register = async (req,res) =>{
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        return res.json({success:false, message:"Missing Details"});
    }

    try {
        
        const existingUser = await userModel.findOne({email});
        if(existingUser) {
            return res.json({success:false, message:"User already exists"});
        }

        const hashpass = await bycrypt.hash(password, 10);

        const newUser = new userModel({name, email, password:hashpass});
        await newUser.save();

        const token = JWT.sign({id : newUser._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?"none":'strict',
            maxAge:7*24*60*60*1000 // 7 days
        });

        return res.json({success:true, message:"User registered successfully"});

    } catch (error) {
        console.log(error);
        return res.json({success:false, message:error.message});    
    }
}

export const login  = async (req,res) =>{
    const{email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message:"Email and Password, both are required"});
    }

    try{

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }

        const isValid = await bycrypt.compare(password, user.password);
        if(!isValid){
            return res.json({success:false, message:"Invalid Credentials"});
        }

        const token = JWT.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?"none":'strict',
            maxAge:7*24*60*60*1000 // 7 days
        });

        return res.json({success:true, message:"User logged in successfully"});

    }
    catch(error){
        return res.json({success:false, message:error.message});
    }
}

export const logout = async (req,res) =>{
    try{
        res.clearCookie('token', {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?"none":'strict',
        });
        return res.json({success:true, message:"User logged out successfully"});
    } catch(error){
        return res.json({success:false, message:error.message});
    }
}