const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

//create a section
exports.createSection = async(req,res)=>{
    try{
        //DATA FETCH
        const{sectionName , courseId} = req.body;
        //VALIDATION
        if(!sectionName || !courseId){
            return res.status(400)
            .json({
                success:false,
                message:'all fields r required',
            });
        }

        //CREATE SECTION WITH A GIVEN NAME
        const newSection = await Section.create({sectionName});

        // Add the new section to the course's content array
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        //use populate to replace section n subsection both in the updated course detals
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        //RETURN RESPONSE
        return res.status(200)
            .json({
                success:true,
                message:'Section created successfully',
                updatedCourseDetails,
            });
    }
    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'unable to create section, please try again later',
                error:error.message,
            });
    }
}


//update a section 
exports.updateSection = async(req,res)=>{
    try{
        //DATA I/P
        const{sectionName , sectionId , courseId } = req.body ;

        //VALIDATE DATA
        if(!sectionId || !sectionName || !courseId ){
            return res.status(400)
            .json({
                success:false,
                message:'all feilds r required',
            });
        }

        //UPDATE DATA
        const section = await Section.findByIdAndUpdate(sectionId , {sectionName} ,{new:true});

        const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

        //RETURN REPONSE
        return res.status(200)
            .json({
                success:true,
                message:'section updated successfully',section,
                data:course,
            });
    }
    catch(error){
        console.log("error while updating section" , error)
        return res.status(500)
            .json({
                success:false,
                message:'unable to update section, please try again later',
                error:error.message,
            });
    }
}

//delete section
exports.deleteSection = async(req,res)=>{
    try{
        //GET ID
        const {sectionId , courseID} = req.body;
        const removeCourse = await Course.findByIdAndUpdate(courseID, {
			$pull: {
				courseContent: sectionId,
			}
		})

        //DELETE
        const section = await Section.findByIdAndDelete({sectionId});
        console.log(sectionId, courseID);
        if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

        //delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();
        
        //RETURN RESPONSE
        return res.status(200)
            .json({
                success:true,
                message:'detelted section successfully',
            });
    }

    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'unable to delete section, please try again later',
                error:error.message,
            });
    }
}
