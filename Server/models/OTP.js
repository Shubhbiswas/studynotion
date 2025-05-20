const mongoose = require("mongoose");
const mailSender = require("../utils/mailsender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        //trim:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5 * 60, // The document will be automatically deleted after 5 minutes of its creation time
    },
});


//yh function mh 2 chj pass krna rhagea -->kisko mail bhju or kiss otp k sath bhju .
//email bhejne ka function hai
//STEPS:- // Create a transporter to send emails
	     // Define the email options
	    // Send the email

async function sendVerificationEmail(email , otp) 
{// Sabse pehle ye function call hota hai → ye mailSender ko call karta hai mail bhejne ke liye  
    try{
        const mailResponse = await mailSender(email,
                                            "Verification mail form StudyNotion" , 
                                            emailTemplate(otp) 
        );

        console.log("Email sent sucessfuly", mailResponse.response);
    }
    catch(error){
        console.log("error occurred while sending mail" , error);
        throw error; 
    }
}

//abh mail ja chuka h user k pass or jaise he mail gaya, vaise he db mh entry hoga or isk liye hume pree middleware use kiya h or save method
// Define a post-save hook to send email after the document has been saved    
    OTPSchema.pre("save" ,async function(next){
        console.log("New document saved to database")

        // Only send an email when a new document is created
        if (this.isNew) {
		    await sendVerificationEmail(this.email, this.otp);
	    }
        next(); //go to the next middleware
    })

module.exports = mongoose.model("OTP" , OTPSchema);