// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

//auth
exports.auth = async(req,res,next)=>{
    try{
        //fetch data
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer" , " ");

        //if token missing , send response-->return 401 Unauthorized response
        if(!token)
        {
            return res.status(401)
            .json({
                success:false,
                message:'token is missing',
            });
        }

        //verify the token using the secret key stored in environment variables
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("token",decode);
            // Storing the decoded JWT payload in the request object for further use
            req.user = decode ;
        }
        catch(error){
            // If JWT verification fails, return 401 Unauthorized response
            return res.status(401)
            .json({
                success:false,
                message:'token is invalid',
            });
        }
        // If JWT is valid, move on to the next middleware or request handler
        next() ;
    }
    catch(error){
        return res.status(401)
            .json({
                success:false,
                message:'something went wrong while valdating the token',
            });
    }
}

//isstudent

exports.isStudent = async(req,res)=>{
    try{
        if(req.user.accountType !== "Student")
        {
            return res.status(401)
            .json({
                success:false,
                message:'this is a protected route for students only',
            });
        }
        next() ;
    }
    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'user role cant verified , please try again later',
            });
    }
}

//isInstructor


exports.isInstructor = async(req,res)=>{
    try{
        if(req.user.accountType !== "Instructor")
        {
            return res.status(401)
            .json({
                success:false,
                message:'this is a protected route for Instructor only',
            });
        }
        next() ;
    }
    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'user role cant verified , please try again later',
            });
    }
}

//isAdmin

exports.isAdmin = async(req,res)=>{
    try{
        if(req.user.accountType !== "Admin")
        {
            return res.status(401)
            .json({
                success:false,
                message:'this is a protected route for Admin only',
            });
        }
        next() ;
    }
    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'user role cant verified , please try again later',
            });
    }
}