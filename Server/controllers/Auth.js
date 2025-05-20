const bcrypt = require('bcryptjs');
const User = require("../models/User")
const OTP = require("../models/OTp")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailsender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

//send OTP --> iska kaam h ki otp craete krega 
exports.sendOTP = async(req,res)=> {
    try{
        //fetch email
        const{email} = req.body ;

        //check if user alrdy exist
        // Find user with provided email
        const checkUserPresent = await User.findOne({email}); // to be used in case of signup

        //if user exists with provided email
        if(checkUserPresent)
        {
            return res.status(401)
            .json({
                success:false,
                message:'User already registerd',
            });
        }

        //agar user exist nai krta toh otp generate kao
        //GENERATE OTP
        //hum otp genertor kr rhe h by using .generate function -->ismh 2hj dete h phela kitne length ka otp chaiye dusra options
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("otp generated" , otp) ;

        //CHECK UNIQUE OTP OR NOT-->means ki phele yh otp kbhi use nai kiya hona chaiye
        const result = await OTP.findOne({otp: otp}) ;
        console.log("Result is Generate OTP Func")
        console.log("OTP", otp)
        console.log("Result", result)
        
        //agar new otp unique nai hua toh phirse otp genrate kro
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp}) ;
        }

        //ABH ISS OTP KA DATA DB MH GENERATE KARO
        const otpPayload ={email,otp} ;
        const otpBody = await OTP.create(otpPayload) ; //craete an entry for OTP
        console.log("otpBody" , otpBody) ;

        return res.status(200)
        .json({
            success:true,
            message:'otp sent succesfully',
            otp,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500)
        .json({
            success:false,
            message:error.message,
        });
    }
}

//signUp Controller for Registering USers
exports.signUp = async(req,res)=>{
    try{
        //fetch data from reqbody-->desturcting fields
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}= req.body;
         
        // Log the values for debugging
        console.log("First Name:", firstName);
        console.log("Last Name:", lastName);
        console.log("Email:", email);

        //vaildate karo
        if(!firstName || !lastName || !email || !password || !otp || !confirmPassword){
            return res.status(403)
            .json({
                success:false,
                message:'please fill all the details',
            });
        }

        //2PASSWORD MATCH KARO--> means psswrd n confirmpsswrd should b same
        if(password !== confirmPassword)
        {
            return res.status(400)
            .json({
                success:false,
                message:'paasword doesnt matches',
            });
        }

        //check if user aldry exists
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            return res.status(400)
            .json({
                success:false,
                message:'User already registerd, Please sign in to continue',
            });
        }

        //FIND MOST RECENT OTP --> BY USNG SORT FUNCTION
        const recentOtp = await OTP.find({ email }).sort({createdAT:-1}).limit(1);
        console.log("recentOtp" , recentOtp) ;

        //VALIDATE OTP-->checking otp
        if(recentOtp.length == 0)
        {
            return res.status(400)
            .json({
                success:false,
                message:'OTP not found',
            });
        }
        //yaha dono otp check kr rhe h -> means ki otp means joh db mh padha hua h or recentotp means joh abhi aya h otp
        else if(otp !== recentOtp[0].otp){
            return res.status(400)
            .json({
                success:false,
                message:'Invalid otp',
            });
        }

        //hashed passwrd
        const hashedPassword = await bcrypt.hash(password,10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)

        //ENTRY CREATE IN DB-->means signup hogaya hoga abh sare details db mh dalo
        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails: profileDetails._id, 
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`, 
        });
        console.log('First Name:', firstName);
        console.log('Last Name:', lastName);

        return res.status(200)
            .json({
                success:true,
                message:'user is registered successfully',
                user,
            });


    }
    catch(error){
        console.log("SIGNUP ERROR:", error);
        return res.status(500)
            .json({
                success:false,
                message:'user cant register,please try again later',
                error: error.message,
            });
    }
}
// //chatgpt signup
// exports.signUp = async (req, res) => {
//     try {
//         // fetch data from request body
//         const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

//         // Validate the presence of required fields
//         if (!firstName || !lastName || !email || !password || !otp || !confirmPassword) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Please fill all the details',
//             });
//         }

//         // Check if password and confirmPassword match
//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Password doesn’t match',
//             });
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User already registered, Please sign in to continue',
//             });
//         }

//         // Find the most recent OTP
//         const recentOtp = await OTP.find({ email }).sort({ createdAT: -1 }).limit(1);
//         console.log("recentOtp:", recentOtp);

//         // Validate OTP
//         if (recentOtp.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'OTP not found',
//             });
//         } else if (otp !== recentOtp[0].otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid OTP',
//             });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a profile entry for the user
//         const profileDetails = await Profile.create({
//             gender: null,
//             dateOfBirth: null,
//             about: null,
//             contactNumber: null,
//         });

//         // Create the user in the database
//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             password: hashedPassword,
//             accountType,
//             contactNumber,
//             additionalDetails: profileDetails._id, 
//             image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`, 
//         });

//         // Log the created user details
//         console.log("Created User:", user);

//         // OPTIONAL: Fetch the saved user from the database to verify if firstName and lastName are correctly saved
//         const savedUser = await User.findOne({ email: user.email }).populate("additionalDetails");
//         console.log("Saved User After Registration:", savedUser);

//         return res.status(200).json({
//             success: true,
//             message: 'User is registered successfully',
//             user: savedUser,
//         });

//     } catch (error) {
//         console.log("SIGNUP ERROR:", error);
//         return res.status(500).json({
//             success: false,
//             message: 'User cannot register, please try again later',
//             error: error.message,
//         });
//     }
// };

// mine login
exports.login = async(req,res)=>{
    try{
        //fetch data
        const{email,password} = req.body;

        //validate kar
        if(!email || !password){
            return res.status(400)
            .json({
                success:false,
                message:'please fill all the details',
            });
        }

        //check user exist or not with provided email
        const user = await User.findOne({email}).populate("additionalDetails");
        console.log("Found User:", user);

        // If user not found with provided email
        if(!user)
        {
            return res.status(401)
            .json({
                success:false,
                message:'user is not registered,please sign up to continue',
            });
        }

        //Genetate JWT token , and Compare Password
        if(await bcrypt.compare(password, user.password)){
            const payload={
                email : user.email,
                id : user._id,
                role:user.role,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"24h",
            });
            console.log("Generated JWT Token is:", token);

            // Save token to user document in database
            user.token = token;
            user.password= undefined;

            //set cookie for token n return sucess response
            const options={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token" , token , options).status(200)
            .json({
                success:true,
                token,
                user,
                message: "Login successful",
            });
        }
        //jbh password match nai hoga
        else{
            return res.status(401)
            .json({
                success:false,
                message:'password doesnt matches',
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500)
            .json({
                success:false,
                message:'login failure,please try agan',
            });
    }
}

//LOGIN - GPT DOWN ONE line 258se
// login
// exports.login = async(req,res)=>{
//     try{
//         //fetch data
//         const{email, password} = req.body;

//         //validate kar
//         if(!email || !password){
//             return res.status(400)
//             .json({
//                 success:false,
//                 message:'please fill all the details',
//             });
//         }

//         //check user exist or not with provided email
//         const user = await User.findOne({email}).populate("additionalDetails");
        
//         // If user not found with provided email
//         if(!user) {
//             console.error("User not found with email:", email);  // Log if user is not found
//             return res.status(401)
//             .json({
//                 success:false,
//                 message:'user is not registered,please sign up first',
//             });
//         }

//         // Compare Password
//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if(!isPasswordMatch) {
//             console.error("Password mismatch for user:", email);  // Log if password doesn't match
//             return res.status(401)
//             .json({
//                 success:false,
//                 message:'Incorrect password',
//             });
//         }

//         // Generate JWT Token
//         const payload = {
//             email : user.email,
//             id : user.id,
//             accountType: user.accountType,
//         };
        
//         const token = jwt.sign(payload, process.env.JWT_SECRET, {
//             expiresIn: "24h",
//         });

//         // Log the generated JWT token
//         console.log("Generated JWT Token:", token);

//         // Send response with the generated token
//         return res.status(200).json({
//             success:true,
//             message:"Logged in successfully",
//             token,  // send token in response body
//             user,
//         });
//     }
//     catch(error){
//         console.error("Login error:", error);  // Log the error details
//         return res.status(500)
//             .json({
//                 success:false,
//                 message:'Login failure, please try again',
//                 error: error.message,
//             });
//     }
// }

// login
// exports.login = async(req,res)=> {
//     try {
//         const { email, password } = req.body;

//         // validate
//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'please fill all the details',
//             });
//         }

//         // check user exist or not
//         const user = await User.findOne({ email }).populate("additionalDetails");

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'user is not registered,please sign up first',
//             });
//         }

//         // check password
//         if (await bcrypt.compare(password, user.password)) {
//             const payload = {
//                 email: user.email,
//                 id: user.id,
//                 accountType: user.accountType,
//             };
//             const token = jwt.sign(payload, process.env.JWT_SECRET, {
//                 expiresIn: "24h",
//             });

//             // Save token to user document in database
//             user.token = token;
//             user.password = undefined;

//             // send response with token and user data
//             return res.status(200).json({
//                 success: true,
//                 message: "Login successful",
//                 token,
//                 user: {
//                     ...user.toObject(),
//                     firstName: user.firstName, // Ensure firstName is included
//                     lastName: user.lastName,   // Ensure lastName is included
//                 },
//             });
//         } else {
//             return res.status(401).json({
//                 success: false,
//                 message: 'password does not match',
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: 'login failure, please try again',
//         });
//     }
// }

//changePassword
exports.changePassword = async (req, res) => {
    try {
      // 1. Get user ID from req.user
      const userId = req.user.id;
      const userDetails = await User.findById(userId);
    //   if (!userDetails) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "User not found",
    //     });
    //   }
  
      // 2. Get old and new passwords from req.body
      const { oldPassword, newPassword } = req.body;
  
      // 3. Validate old password
      //userDetails.password is the existing (old) password that is already stored (hashed) in the database.
      const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

       // If old password does not match, return a 401 (Unauthorized) error
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Your password is incorrect",
        });
      }
  
      // 4. Hash the new password
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
  
      // 5. Update password in DB
      const updatedUserDetails = await User.findByIdAndUpdate(
        userId,
        { password: encryptedPassword },
        { new: true }
      );
  
      // 6. Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        );
        console.log("Email sent successfully:", emailResponse.response);
      } 
      catch (error) {
        console.error("Error occurred while sending email:", error);
        return res.status(500)
        .json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        });
      }
  
      // 7. Send success response
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } 
    catch (error) {
      return res.status(500)
      .json({
        success: false,
        message: "Something went wrong while updating password",
        error: error.message,
      });
    }
};