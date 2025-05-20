//ek course cretae krna h or dursra sare course ana chaie
const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

//create course handler functn
exports.createCourse = async(req,res)=>{
    try{

        // Get user ID from request object
        const userId = req.user.id

        // Get all required fields from request body
        let {
        courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        tag: _tag,
        category,
        status,
        instructions: _instructions,
        } = req.body
        
        //get thumbnail
        const thumbnail = req.files.thumbnailImage ;

         // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions", instructions)

        //VALIDATION
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail  || !category ||
            !instructions.length){
            return res.status(400)
            .josn({
                success:false,
                message:'All details r compulsary',
            });
        }

        if (!status || status === undefined) {
          status = "Draft"
        }

        //CHECK FOR INSTRUCTOR 
        //yaha pr humare pass instructor ki user id toh h but hume intructor ki obj.id set krni h ..usk liye hum sbhse phele instructor ki user id nikalenge using payload which v had wrtten on middleware file -->req.user = decode
        //phr humne voh user id se intructor ki sari detils nikal li db mh se or phir bhdmh obj id mh use krliya
        //const userId = req.user.id;//yaha pr instructor ki user id aayegi-->yh line upar likha h ekdum top meh
        const instructorDetails = await User.findById(userId,
                                                      {
                                                        accountType:"Instructor",
                                                      }); 

        console.log("instructor details" , instructorDetails);

        if(!instructorDetails){
            return res.status(404)
            .json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        //CHECK GIVEN TAG IS NOT VALID(PARTICULARLY FOR BACKEND)
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails)
        {
            return res.status(404)
            .json({
                success:false,
                message:'Category Details not found',
            });
        }

        //UPLAOD IMG TO CLOUDINARY-->yaha 2 chj pass hoti h ek toh file ka naam or dusra folder ka naam joj cloudinary mh save hoga
        const thumbnailImage = await uploadImageToCloudinary(
                                                              thumbnail, 
                                                              process.env.FOLDER_NAME
                                                            );
        console.log(thumbnailImage);

        //CRAETE AN ENTRY FOR NEW COURSE
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id, //yah pr instructor k andhr humne uski obj.id stor krdih
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag : tagDetails._id,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url, //yaha pr uss thumbnail ka ek secure url hoga voh stormkrliya jiss paya chalega ki isntructor ka imga kya h 
            status: status,
            instructions,
        })
        
        //ADD THE NEW COURSE TO THE INSTRUCTORS PROFILE
        //instructor k list uska yh vala course bhi add krna h 
        await User.findByIdAndUpdate(
            instructorDetails._id , //isse humne instructor ko find kiya
            {   //add krdo yh vala courses k array mh instructor ka yh new course.
                $push:{
                    courses : newCourse._id,
                }
            },
            {new:true},//return updated
        );

        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        )
        console.log("HEREEEEEEEE", categoryDetails2)

        // RETRUN RESPONSE
        return res.status(200)
        .json({
            success:true,
            data: newCourse,
            message:"Course creted successfully",
        });
    }
    catch(error){
        return res.status(404)
            .json({
                success:false,
                message:'If fail to create course',
                error : error.message,
            });
    }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)
  
        if (!course) {
            return res.status(404).
            json({ error: "Course not found" })
        }
    
        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }
  
        // Update only the fields that are present in the request body
        for (const key in updates) 
        {
            if (updates.hasOwnProperty(key)) 
            {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }
  
        await course.save()
  
        const updatedCourse = await Course.findOne({
                        _id: courseId,
            })
            .populate({
                    path: "instructor",
                    populate: {
                        path: "additionalDetails",
                    },
                })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
            })
            .exec()
    
            res.json({
                success: true,
                message: "Course updated successfully",
                data: updatedCourse,
            })
    } 
    catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }


//get all course handler functn
exports.getAllCourses = async(req,res)=>{
    try{
        const allCourses = await Course.find({} ,{courseName:true ,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true,
                                            })
                                            .populate("instructor")
                                            .exec();
        return res.status(200)
        .json({
        success:true,
        message:"data for all course fetch successfully",
        data:allCourses,
    });
    }
    catch(error){
        console.log(error);
        return res.status(500)
        .json({
            success:false,
            message:"Cannot fetch course",
            error:error.message,
        });
    }
}

//course ka entire details 
exports.getCourseDetails = async(req,res)=>{
    try{
        //GET COURSEID FROM REQ.BODY
        const {courseID} = req.body;
        
        //REMOVE COURSE DETAILS 
        const courseDetails = await Course.findOne(
                                                    {_id:courseID})
                                                    .populate({
                                                        path:"instructor",
                                                        populate:{
                                                            path:"addtionalDetails",
                                                        },
                                                    })
                                                    .populate("category")
                                                    .populate("ratingAndReviews")
                                                    .populate({
                                                        path:"courseContent",
                                                        populate:{
                                                            path:"subSection",
                                                            select: "-videoUrl",
                                                        },
                                                    })
                                                    .exec();

        //VALIDATION
        if(!courseDetails){
            return res.status(400)
            .json({
                success:false,
                message:`could not find the course with the given ${courseID}`,
            });
        }
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        //RETURN RESPONSE
        return res.status(200)
        .json({
            success:true,
            data: {
                courseDetails,
                totalDuration,
            },
            //message:`course details fetch successfully`,
        });
    }
    catch(error){
        return res.status(500)
        .json({
            success:false,
            message:error.message,
        });
    }
}

//get full course details
exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}
  
// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
}
  
// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnroled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
}











