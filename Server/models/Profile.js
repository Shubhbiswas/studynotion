const mongoose = require("mongoose") ;

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
        //required:true,
    },
    dateOfBirth:{
        type:String,
        //required:true,
    },
    about:{
        type:String,
        //required:true,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true,
    },
         
});
//export the profile model
module.exports = mongoose.model("Profile" , profileSchema) ;