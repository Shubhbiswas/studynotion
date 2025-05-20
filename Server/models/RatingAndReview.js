const mongoose = require("mongoose");

// Define the RatingAndReview schema
const ratingAndReviewScehma = new mongoose.Schema({
    user:{ //konse user ne rating diya h 
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    rating:{
        type:Number,
        required:true,
    },
    review:{
        type:String,
        required:true,
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
});

module.exports = mongoose.model("RatingAndReview" , ratingAndReviewScehma);