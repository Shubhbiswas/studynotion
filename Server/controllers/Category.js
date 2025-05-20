// category are created to categorize courses. 
// Before displaying courses, we filter them based on selected category.
// For example, if a user selects the "Python" tag, only Python-related courses will be shown.

//importing tag model
const { Mongoose } = require("mongoose");
const Category = require("../models/Category");

//create category ka handler function-->1 category create kr rhe h 
exports.createCategory = async(req,res)=>{
    try{
        //data fetch
        const{name,descripton} = req.body;

        //validation
        if(!name || !descripton)
        {
            return res.status(400)
            .json({
                success:true,
                message:"all fields r compulsary", 
            })
        }

        //Create a new tag entry in the database
        const CategoryDetails = await Category.create({
           name:name,
           descripton:descripton, 
        });
        console.log(CategoryDetails);

        //return response
        return res.status(200)
        .json({
            success:true,
            message:"Category Created succesfully",
        });
    }
    catch(error){
        return res.status(500)
        .json({
            success:false,
            message:error.message,
        });
    }
}

//get all Category ka handler function
//jaise he koi Category select kiya usk Category k jitne bhi videos honge voh iss handler functn k madat se ayega
exports.showAllCategories = async(req,res)=>{
    try{
        //get all Category mh hum find kn k basis mh kr rhe h but make sure 1thing ki name or description toh ana he chaiye
        const allCategorys = await Category.find({} , {name:true, descripton:true}) ;

        return res.status(200)
        .json({
            success:true,
            message:"All Category returned successfully",
            allCategorys,
        });
    }
    catch(error){
        return res.status(500)
        .json({
            success:false,
            message:error.message,
        });
    }
}

//Category page details
//CATEROGY K BASIS K UPAR COURSES DIKHA RHE H
//jase ki for eg agar maine category set kiya h most popular courses toh joh bhi uss website ka most popular courses hoga voh aajayega
exports.categoryPageDetails = async(req,res)=>{
    try{
        //GET CATEGORY ID
        const{categoryId} = req.body ;

        //USS CATEGORY K CORRESPONDING JITNE BHI COURSES H FETCH KRLO
        const selectedCategory = await Category.findById(categoryId).populate("courses").exex();

        //VALIDATION -->maan lo koi courses he na aaye
        if(!selectedCategory){
            return res.status(404)
            .json({
                success:false,
                message:'data not found',
            });
        }

        //GET COURSES FOR DIFF. CATEGORIES
        const differentCategories = await Category.findBy({
            _id:{$ne:categoryId}, // joh category user ne search kiya h voh category k courses ko mat dikhana dusra kuch dikhana $ne means not equals to
        })
            .populate("couses")
            .exec();
       

        //GET TOP SELLING COURSES-->HW
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.course)
        const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       console.log("mostSellingCourses COURSE", mostSellingCourses)
        
    
        //RETURN RESPONSE
        res.status(200).json({
            success: true,
            data: {
              selectedCategory,
              differentCategories,
              mostSellingCourses,
            },
        })
    }
    catch(error){
        console.log(error)
        return req.status(500)
        .json({
            success:false,
            message:'internal server error',
        });
    }
}