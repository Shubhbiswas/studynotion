const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//resetpsserdtoken
exports.resetPasswordToken = async(req , res) =>{

    try{
        //FETCH DATA ->EMAIL FROM REQ BODY
        const{email} = req.body;
        
        //CHECK USER FOR THS EMAIL , EMAIL VERIFICATION
        const user = await User.findOne({email}) ;
        if(!user)
        {
            return res.status(400)
            .json({
                success:false,
                message:'your email is not registerd with us',
            })
        }

        //GENERATE TOKEN-->crypto se ek token unique generte kiya
        //yh token sirf ek unique random string hota hai
        //Is token ka use password reset link mein hoga
        const token = crypto.randomUUID() ;

        //UPDATE USER BY ADDING TOKEN AND EXPIRY TIME
        //yaha user k andhr token isliye daal rhe h bcoz user k schema k andhr password section h 
        //or humhe vaha bhi toh change krna padega na so vaha change krne k hume user ki details lagegi
        //or user k deatils ko nikalne k liye hum use krenge token ka
        const updatedDetails = await User.findOneAndUpdate({email:email},// jiske email se request aayi, us user ko dhoondo
            {//or changes yh kardo ki user mh token or resetpasswrdexpiry ka time dedo 5mins
                token : token,//ek token joh user k schema k andhr ka token h voh h or ek token joh hume abhi crypto k dwara se mila h voh hai..-->User schema ke 'token' field mein yeh token save karo
                resetPasswordExpires: Date.now() + 5*60*1000, // ab se 5 minutes tak valid hoga
            },
            {new:true},//updated docx return hoga response meh token ki value or expiry time k sath
        );

        //CREATE URL
        const url = `https://localhost:3000/update-password/${token}`;

        //SEND MAIL WHICH CONTAIN THE URL
        await mailSender(email,"password reset link" , `password reset link ${url}`);

        //RETURN RESPOSNSE
        return res.status(200)
            .json({
                success:true,
                message:'Email send succesfully, please check mail n change password',
            })
    }

    catch(error){
        console.log(error)
        return res.status(500)
            .json({
                success:false,
                message:'something went wrong ',
            })
    }

}

//resetpsswrd-->
// actual password ko change krne vale h upar vale mh humne ke link bhja h psswrod change krneka
// yaha hum new psswrd enter krne vale h 

exports.resetPassword = async(req,res)=>{
    try{
       //DATA FETCH
       const{password , confirmPassword, token} = req.body;

       //VALIDATION
       if(password!==confirmPassword)
       {
            return res.status(401)
            .json({
                success:false,
                message:'password not matching',
            });
       }

       //GET USER DETAILS FROM DB USING TOKEN
       const userDetails = await User.findOne({token});
       //IF NO ENTRY - INVALID TOKEN-->bcoz hum token k adhar pr user ko find kr rhe h
       if(!userDetails)
       {
        return res.status(401)
            .json({
                success:false,
                message:'token invalid',
            });
       }
       //TOKEN TIME CHECK
       if(userDetails.resetPasswordExpires < Date.now()){
        return res.status(401)
            .json({
                success:false,
                message:'token time expires , please regenerate ur token',
            });
       }
       //HASH PSSWRD
       const hashedPassword = await bcrypt.hash(password , 10);
       //PASSWRD UPADTE
       await User.findOneAndUpdate({token:token} , //isk adhar pr leke aao
        {passsword:hashedPassword},//update passwordd with new password
        {new:true},
       )
       //RETURN RESPOSNSE
       return res.status(200)
            .json({
                success:true,
                message:'password updated succesfully',
            });
    }
    catch(error){
        return res.status(401)
            .json({
                success:false,
                message:'password not updated, something went worng',
            });
    }
}