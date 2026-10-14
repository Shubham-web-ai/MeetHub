import httpStatus from "http-Status";
import {User} from "../models/userSchema.js";
import bcrypt,{hash} from "bcrypt";
import crypto from "crypto";

const login=async (req,res)=>{
    const {username , password}=req.body;
    console.log(req.body);
    //validation
    if(!username || !password){
        return res.status(400).json({message:"Please Provide"});
    }
    try{
        const user=await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User not register"});
        }
        if(bcrypt.compare(password,user.password)){
            let token=crypto.randomBytes(20).toString("hex");

            user.token=token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token});
        }
    } catch (e){
        res.json({message:`something went wrong ${e}`});
    }
}

const register=async (req,res)=>{
    const {name,username,password} =req.body;
    console.log(req.body);
    try{
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message:"User already register"});
        }
        const hassedPassword=await bcrypt.hash(password,10);
        const newUser=new User({
            name:name,
            username:username,
            password:hassedPassword,
            token
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"User Registered"});
    } catch (e){
        res.json({message:`something went wrong ${e}`});
    }
}

export {login,register};