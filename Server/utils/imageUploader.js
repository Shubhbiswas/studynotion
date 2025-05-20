const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async(file,folder,height,quality)=>{
    const options = {folder};

    //yh sbh chj reduce k liye h yani ki compress..
    // If height is provided, add it to the options for resizing the image
    if (height) {
        options.height = height;
    }

    // If quality is provided, add it to the options to reduce image file size
    if (quality) {
        options.quality = quality;
    }

    //apne app set krlega ki kiss type ka resource h file h ya folder h ya imh h 
    options.resource_type = "auto";
    
    // Upload the file to Cloudinary using the temporary file path and the defined options
    return await cloudinary.uploader.upload(file.tempFilePath , options);

}
