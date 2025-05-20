const nodemailer = require("nodemailer") ;

// Function to send an email using Nodemailer--> i want to send an email to the user ..
const mailSender = async(email , title , body) =>{
    try{

        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        // Define the email options and send the email 
        let info = await transporter.sendMail({
            from: 'StudyNotion',
            to: `${email}`,
            subject: `${title}`,
            html:`${body}`, //main content 
        })

        console.log(info.response) ;
        return info;
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender ;