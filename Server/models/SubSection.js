const mongoose = require("mongoose") ;

// basically yh ek video ko darshata h ..
const subSectionSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    timeDuration:{
        type:String,
    },
    description:{
        type:String,
    },
    videoUrl:{
        type:String,
    },
       
})

module.exports = mongoose.model("SubSection" , subSectionSchema) ;