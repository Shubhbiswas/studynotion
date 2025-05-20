const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//create a rating 
exports.createRating = async(req,res)=>{
    try{
        //DATA FETCH FROM REQUEST KI BODY
        const{courseId , rating , review} = req.body;

        //USER ID FROM AUTH MIDDLEWARE
        const userID = req.user.id ;

        //CHECK IF USER IS ENROLLED OR NOT
        const courseDetails = await Course.findOne(
                                                    {_id:courseId,//yh id se find kr rhe h 
                                                    studentsEnrolled:{$elemMatch:{$eq: userID}}, // studentsEnrolled mh find kr rhe h ki kya usmh koi yh id se student present hai ki nai ..a new way syntax to find 
                                                });
        if(!courseDetails)
        {
            return res.status(404)
            .json({
                success:false,
                message:`student not enrolled in the course`,
            });
        }

        //CHECK THE USER HAD NOT ALREADY REVIEWED THE COURSE
        //ratingandreview mh agr phele se user ki id present hogi or course ki bhi id toh rpesent hogi toh voh phir se review nai kr skta 
        const alreadyReviewed = await RatingAndReview.findOne({
                                                                user:userID,
                                                                course:courseId,
        });

        if(alreadyReviewed){
            return res.status(403)
            .json({
                success:false,
                message:'course is already reviewd by the user'
            })
        }

        //CREATE THE RATING
        const ratingReview = await RatingAndReview.create({
            rating,review,
            course: courseId,
            user: userID,
        });

        //UPDATE THE COURSE SO THAT THE RATINGS GETS ADD IN THAT COURSE
        const updatedCourseDetials = await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    ratingAndReveiws: ratingReview._id,
                }
            },
            {new:true},
        )
        console.log(updatedCourseDetials);

        //RETURN REPSONSE
        return res.status(200)
            .json({
                success:true,
                message:'rating and review created successfully',
                ratingAndReveiws,
            })
    }
    catch(error){
        console.log(error);
        return res.status(500)
            .json({
                success:false,
                message:'rating and review not created successfully'
            })
    }
}


//get avg rating
exports.getAverageRating = async(req,res)=>{
    try{
        //GET COURSE ID
        const {courseId} = req.body ;

        //CALCULATE AVG RATINGS
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating : {$avg :"$rating"},
                }
            }
        ])

        //RETURN RATNG
        if(result.length > 0)
        {
            return res.status(200)
            .json({
                success:true,
                averageRating: result[0].averageRating,
            });
        }

        //if no rating 
        return res.status(200)
            .json({
                success:true,
                message:'avg rating is 0 , no ratings given til now',
                averageRating: 0,
            });
    }
    catch(error){
        console.log(error)
        return res.status(500)
            .json({
                success:false,
                message:error.message,
            });
    }
}

//get all ratings
exports. getAllRating = async(req,res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
                                                    .sort({rating: "desc"})
                                                    .populate({
                                                        path:"user",
                                                        select:"firstName lastName email image "
                                                    })
                                                    .populate({
                                                        path:"course",
                                                        select:"courseName",
                                                    })
                                                    .exec();

        
        return res.status(200)
            .json({
                success:true,
                message:'all reviews fetched successfully',
                allReviews,
            });
    }
    catch(error){
        console.log(error)
        return res.status(500)
            .json({
                success:false,
                message:error.message,
            });
    }
}

