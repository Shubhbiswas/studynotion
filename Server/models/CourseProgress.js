const mongoose = require("mongoose") ;

//course ki id or uss id k through kon konse videos complete ho chuki h 
//Ye batata hai ki ye progress kis course ke liye hai
const courseProgressSchema = new mongoose.Schema({
    courseId:{ //konse course ki bhat ho rhi h
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    //kitna video complete kiya h
    completedVideos:[
        { //aray of completed videos
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
        }
    ]
       
})

module.exports = mongoose.model("courseProgress" , courseProgressSchema) ;