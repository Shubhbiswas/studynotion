const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid-->Ye check karta hai ki jo video (subsection) user dekh raha hai, wo valid hai ya nahi.
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404)
      .json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    //Ye check karta hai ki user ka is course ke liye progress record bana hua hai ya nahi.
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    //agar nai mila record toh return
    if (!courseProgress) {
      // If course progress doesn't exist, create a new one
      return res.status(404).json({
        success: false,
        message: "Course progress Does Not Exist",
      })
    } 
    //agar record mila toh check karta hai ki kahi ye subsection already complete toh nahi
    else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({ error: "Subsection already completed" })
      }
      
      // If found completed then , Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subsectionId)
    }

    // Save the updated course progress
    await courseProgress.save()

    //return repsonse
    return res.status(200)
    .json({
        success:true,
        message: "Course progress updated" ,
    });
  } 
  catch (error) {
    console.error(error)
    return res.status(500)
    .json({ 
        success:false,
        error: "Internal server error", 
    });
  }
}
