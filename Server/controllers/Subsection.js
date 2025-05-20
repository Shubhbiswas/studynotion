const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create SubSection for a given section
exports.createSubSection = async(req,res)=>{
    try{
        //DATA FETCH
        //sectionId khud se send krdiya
        const{sectionID, title , description} = req.body;

        //VIDEO FETCH
        const video = req.files.videoFile ;

        //VALIDATE
        if(!sectionID || !title || !description || !video){
            return res.status(400)
            .json({
                success:false,
                message:'all fields r required',
            });
        }

        //UPLOAD VIDEO TO CLOUDINARY
        const uploadDetails = await uploadImageToCloudinary(
            video , 
            process.env.FOLDER_NAME
        );
        console.log(uploadDetails);

        //Create a new sub-section with the necessary information
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        }) 

        //UPDATE SECTION WTH THIS SUBSECTION OBJ.ID -->Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionID},
                                                                { $push:{
                                                                    subSection: SubSectionDetails._id,
                                                                }},
                                                                {new:true})
                                                                .populate("subSection");

        //RETURN RESPOSNE
        return res.status(200)
            .json({
                success:true,
                message:'Subsection created successfully',
                updatedSection,
            });
  
    }
    catch(error){
        return res.status(500)
            .json({
                success:false,
                message:'internal server error',
                error:error.message,
            });
    }
}

//hw update subsection
exports.updateSubSection = async(req,res)=>{
    try{
        //data fetch-->section update krte samay kya kya chje require h
        const{sectionID , subSectionId , title ,description} =req.body ;

        //validate 
        //find subsection
        const subSection = await SubSection.findById(subSectionId) ;
        if(!subSection){
            return res.status(404)
            .json({
                success: false,
                message: "SubSection not found",
              });
        }

        // Update title if provided
        if (title !== undefined) {
            subSection.title = title;
        }
  
        // Update description if provided
        if (description !== undefined) {
            subSection.description = description;
        }

        // If a video file is provided, upload it to Cloudinary and update video details
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
              video,
              process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }
        await subSection.save()

        
        // find updated section and return it
        const updatedSection = await Section.findById(sectionID)
        .populate(
            "subSection"
        )
    
        console.log("updated section", updatedSection);
        
        //return response
        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        });

    }
    
    catch(error){
        console.log(error);
        return res.json({
            success: false,
            message: "An error occured while Section updated ",
        });
    }
}


//delete subsection from both Section and SubSection collections
//find sectionid n subsection id joh delete krna h jaise he mila delete krde
exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body;
    
      //Remove the subsection reference from the corresponding section
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      //deleting from subsection
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      //after deleting, find updated section and return it with remaining subsections
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      })
    } 
    catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
}
