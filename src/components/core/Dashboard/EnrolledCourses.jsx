import React, { useEffect, useState } from 'react'
import {useSelector} from'react-redux'
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI';
import ProgressBar from "@ramonak/react-progress-bar"
import { useNavigate } from 'react-router-dom';

const EnrolledCourses = () => {

    const {token} = useSelector((state) => state.auth);
    const[enrolledCourses , setEnrolledCourses] = useState(null);
    const navigate = useNavigate() ;
    //backend se getenrolled course ka controller(logic) leke ana h 
    const getEnrolledCourses = async() =>{
        try{
            //backend call krk sare courses ka data manga liya
            const response = await getUserEnrolledCourses(token) ;
            setEnrolledCourses(response) ; //or yaha set kr diya means UI meh show hoga
        }
        catch(error){
            console.log("Unable to fetch ernolled courses")
        }
    }

    useEffect( () =>{
        getEnrolledCourses() ;
    },[]);


  return (
    <div>
      <div>Enrolled Courses</div>
      { // jbh thk enroled courses nai aa rha h tbh thk loading dikaho
        !enrolledCourses ? (
            <div>
                Loading...
            </div>
        ) :
        //abh yaha enrolled courses agar aagye toh sbhse phele uska length check kro -->agar length 0 hai toh ska mtlb h ki course he nai enrolled kiya h
        !enrolledCourses.length ?(<p>u have not enrolled in any courses yet!!!</p>)
        : //yaha iska mtlb h ki courses aagye bhi gay h + user ne kuch courses me ernolled bhi kiya toh voh show karo ki user ne konse courses mh enrolled kiya h krk
        (
            <div className="my-8 text-richblack-5">
                {/* Headings */}
                <div className="flex rounded-t-lg bg-richblack-500 ">
                    <p className="w-[45%] px-5 py-3">Course Name</p>
                    <p className="w-1/4 px-2 py-3">Duration</p>
                    <p className="flex-1 px-2 py-3">Progress</p>
                </div>

                {/* Course Names */}
                {enrolledCourses.map((course, i, arr) => (
                    <div
                        className={`flex items-center border border-richblack-700 ${
                        i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                        }`}
                        key={i}
                    >
                    <div
                    className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                        onClick={() => {
                        navigate(
                            `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                        )
                        }}
                    >
                        {/* thumbnail , courseName, courseDescription */}
                    <img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-14 w-14 rounded-lg object-cover"
                    />

                    <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="text-xs text-richblack-300">
                        {course.courseDescription.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription
                        }
                    </p>
                    </div>
                </div>
                        
                    {/* Duration */}
                <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>
                <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                    <p>Progress: {course.progressPercentage || 0}%</p>
                    <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                    />
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default EnrolledCourses 