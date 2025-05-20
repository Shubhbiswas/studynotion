const express = require("express") ;
const app = express() ;

//impot routes
const userRoutes = require("./routes/User") ;
const profileRoutes = require("./routes/Profile") ;
const paymentRoutes = require("./routes/Payments") ;
const courseRoutes = require("./routes/Course") ;

//database
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

const PORT = process.env.PORT || 4000 ;

//db connect
database.connect();

//add moddlewares
app.use(express.json());
app.use(cookieParser());
//imp line..means joh bhi meri req frontend se aa rhi h usse backedn entertain krna hai
app.use(
    cors({
        orign:"http://localhost:3000", //frontend
        credentials:true,
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp",
    })
)

//cloudinary connection
cloudinaryConnect() ;

//routes
app.use("/api/v1/auth" ,userRoutes);
app.use("/api/v1/payment" ,paymentRoutes);
app.use("/api/v1/profile" ,profileRoutes);
app.use("/api/v1/course" ,courseRoutes);

//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})
