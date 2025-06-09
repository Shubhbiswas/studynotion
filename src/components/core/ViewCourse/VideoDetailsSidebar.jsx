import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import IconBtn from "../../common/IconBtn"

export default function VideoDetailsSidebar({ setReviewModal }) {

    //konsa section active h ya non active h 
    const [activeStatus, setActiveStatus] = useState("")
    //konsa video active h ya non active h 
    const [videoBarActive, setVideoBarActive] = useState("")
    const navigate = useNavigate()
    const location = useLocation()
    const { sectionId, subSectionId } = useParams() //for filtering
    const {courseSectionData,courseEntireData,totalNoOfLectures,completedLectures,} = useSelector((state) => state.viewCourse)

    useEffect(() => {
    const setActiveFlags = () => {
            //agar secton mh data he nai h 
        if (!courseSectionData.length) 
            return
            //current section mh jismh hu ..
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )
        //current subsection ka index 
        const currentSubSectionIndx = courseSectionData?.[
            currentSectionIndx
        ]?.subSection.findIndex((data) => data._id === subSectionId)

        //current active subsection id 
        const activeSubSectionId =
            courseSectionData[currentSectionIndx]?.subSection?.[
            currentSubSectionIndx
            ]?._id
            //konsa active secton chal rha h abhi uski id set krdi 
        setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
        //konsa active subsection chal rha h abh uski id set krdi 
        setVideoBarActive(activeSubSectionId)

        }
        setActiveFlags() ;
    }, [courseSectionData, courseEntireData, location.pathname]) //yh fucntion tbh chalega jbh jbh yh sbh change ho

    return (
        <>
        <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
            <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
            <div className="flex w-full items-center justify-between ">
                {/* for back button */}
                <div
                onClick={() => {
                    navigate(`/dashboard/enrolled-courses`)
                }}
                className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
                title="back"
                >
                <IoIosArrowBack size={30} />
                </div>

                {/* add Review btn */}
                <IconBtn
                text="Add Review"
                customClasses="ml-auto"
                onclick={() => setReviewModal(true)} //true means modal is open
                />
            </div>
            {/* coursename and no of lectures completed and remaing */}
            <div className="flex flex-col">
                <p>{courseEntireData?.courseName}</p>
                <p className="text-sm font-semibold text-richblack-500">
                {completedLectures?.length} / {totalNoOfLectures}
                </p>
            </div>
            </div>
            
            <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
            {courseSectionData.map((section, index) => (
                <div
                    className="mt-2 cursor-pointer text-sm text-richblack-5"
                    onClick={() => setActiveStatus(section?._id)}
                    key={index}
                >
                {/* Section */}
                <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                    <div className="w-[70%] font-semibold">
                    {section?.sectionName}
                    </div>
                    <div className="flex items-center gap-3">
                    {/* <span className="text-[12px] font-medium">
                        Lession {course?.subSection.length}
                    </span> */}
                    <span
                        className={`${
                        activeStatus === section?.sectionName
                            ? "rotate-0"
                            : "rotate-180"
                        } transition-all duration-500`}
                    >
                        <BsChevronDown />
                    </span>
                    </div>
                </div>

                {/* Sub Sections */}
                {/* agr koi section active h toh usse show kr  */}
                {activeStatus === section?._id && (
                    <div className="transition-[height] duration-500 ease-in-out">
                    {section.subSection.map((topic, i) => (
                        <div
                        className={`flex gap-3  px-5 py-2 ${
                            videoBarActive === topic._id
                            ? "bg-yellow-200 font-semibold text-richblack-800"
                            : "hover:bg-richblack-900"
                        } `}
                        key={i}
                        //jbh hum uss lec ko dekhna chate h tbh ..use uss path mh render krdo
                        onClick={() => {
                            navigate(
                            `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
                            )
                            setVideoBarActive(topic._id) //current video ko active mark do
                        }}
                        >
                        <input
                            type="checkbox"
                            //tick tbh krna h jbh ..agar voh lec complted lec k andhr aagay toh
                            checked={completedLectures.includes(topic?._id)}
                            onChange={() => {}}
                        />
                        {topic.title}
                        </div>
                    ))}
                    </div>
                )}
                </div>
            ))}
            </div>
        </div>
        </>
    )
}