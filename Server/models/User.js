const mongoose = require("mongoose") ;
const { resetPasswordToken } = require("../controllers/ResetPassword");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    accountType:{
        type:String,
        enum:["Admin" , "Student" , "Instructor"],
        required:true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    additionalDetails: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile", // Reference to Profile model
    },
    courses:[ //there wll b many courses so need to form an array
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Course",
        }   
    ],
    image:{
        type:String,//bcoz yh ek url hoga
        required:true,
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:[
        { //user ne kitan course dekha h 
            type:mongoose.Schema.Types.ObjectId,
            ref:"courseProgress",
        }
    ], 
    // Add timestamps for when the document is created and last modified  
},
    {timestamps:true}   
);

module.exports = mongoose.model("User" , userSchema) ;