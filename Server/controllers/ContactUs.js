const {ContactUsEmail} = require("../mail/templates/contactFormRes") ;
const mailSender = require("../utils/mailsender") ;

exports.ContactUsController = async(req,res) =>{
    try{
        //DATA FETCH FROM USER
        const{firstName , lastName ,email , message, phoneNo , countryCode} = req.body;

        //SEND MAIL 
        const emailRes = await mailSender(email,
            "Your Data Send Successfully",
            ContactUsEmail(firstName , lastName ,email , message, phoneNo , countryCode)
        )
        console.log(emailRes);

        //RETURN RESPONSE
        return res.status(200)
        .json({
            sucess:true,
            message:'email send successfully',
        })
    }
    catch(error){
        console.log(error)
        return res.status(404)
        .json({
            success:false,
            message:'something went worng',
            error:error.message,
        });
    }
}
