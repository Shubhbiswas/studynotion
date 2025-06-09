const{instance} = require("../config/razorpay") ;
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const{courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")
const crypto = require("crypto")
const mongoose = require('mongoose');


//CAPTURE THE PAYMENT AND INITATE THE RAZORPAY ORDER-->means jbh user ne BUY NOW ka btn click kiya hoga tbhi
exports.capturePayment = async (req, res) => {
   //joh bh course buy krna h uski id
    const { courses } = req.body

   //joh bhi user kharid rha h uski id
    const userId = req.user.id

    if (courses.length === 0) {
      return res.json({ success: false, message: "Please Provide Course ID" })
    }
  
    //for buying multiple courses 
    let total_amount = 0
  
    for (const course_id of courses) {
      let course
      try {
        // Find the course by its ID
        course = await Course.findById(course_id)
  
        // If the course is not found, return an error
        if (!course) {
          return res.status(200)
            .json({ 
              success: false, 
              message: "Could not find the Course" 
            })
        }
  
        // Check if the user is already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId) //yaha se userid nikala
        //check karo ki phele se he course buy na kiya ho , agar kiya h phele se buy toh alrdy enrolled
        if (course.studentsEnrolled.includes(uid)) 
        {
          return res
            .status(200)
            .json({ success: false, message: "Student is already Enrolled" })
        }
  
        // Add the price of the course to the total amount
        total_amount += course.price
      } 
      catch (error) {
        console.log(error)
        return res.status(500)
        .json({ 
          success: false, 
          message: error.message 
        })
      }
    }
  
    //creating options -->becoz razorpay mh lgta h syntax ka ek part h
    //agar order create krna h toh options banana he padega ..
    //options mh hum amnt , kis type ka currency or receipt bhjte h
    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(), //? 
    }
    
    // Initiate the payment using Razorpay
    //options k madat se order create krte h
    try {
      //create krne ka syntax
      const paymentResponse = await instance.orders.create(options)
      console.log(paymentResponse)

      res.json({
        success: true,
        data: paymentResponse,
      })
    } 
    catch(error) {
      console.log(error)
      res
        .status(500)
        .json({ 
          success: false, 
          message: "Could not initiate order." 
        })
    }
}
  
// verify the payment-->hum bhas check kr rhe h ki razorpay se joh signature aya h or humne joh signature create kiya h kya voh match kr rha h ?..if yes, then succesfull payment
exports.verifyPayment = async (req, res) => {
  //razorpay ka orderid, signature, payment id leke aao bcoz yh ek feilds h joh chaiye he buy krte tym ..or yh chj acc. to docx h
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses //sara courses joh bhi buy krna h
  
    const userId = req.user.id
  
    //validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) 
    {
      return res.status(200)
      .json({ 
        success: false, 
        message: "Payment Failed" })
    }
   
    // a part of syntax for razorpay 
    // "|" --> this is pipe operator
    let body = razorpay_order_id + "|" + razorpay_payment_id
  
    // "sha256" is an algorihtm 
    // all is syntax 
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex")
  
      //agar humara dono signature match kr gaya toh enrolled krdo
      if (expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res)
        return res.status(200)
        .json({ success: true, 
          message: "Payment Verified"
        })
      }
  
    return res.status(200).
    json({ 
      success: false, 
      message: "Payment Failed" 
    })
} 
  // enroll the student in the courses
  const enrollStudents = async (courses, userId, res) => {
    //validation
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ 
          success: false, 
          message: "Please Provide Course ID and User ID" 
        })
    }
  
    //mere pass mulitple courses h ..or mujhe haar course k andhr user ki id ko add krna h 
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId }, //course ka id nikala 
          { $push: { studentsEnrolled: userId } }, //or joh course kharida h usk andhr user ko add krdiya
          { new: true } //updated return krega
        )
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ 
              success: false, 
              error: "Course not found" 
            })
        }
        console.log("Updated course: ", enrolledCourse)
        

        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses 
        //means student ne konse konse course khdrida h usse bhi dkhega 
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )
  
        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
        console.log("Email sent successfully: ", emailResponse.response)
      } 
      catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      //finding student
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }









//sgnature bana ne k lye oderid , payemnte id ka use ho rha h