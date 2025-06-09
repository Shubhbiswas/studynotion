import React from 'react'
import { sidebarLinks } from '../../../data/dashboard-links'
import { logout } from "../../../services/operations/authAPI"
import { useDispatch, useSelector } from 'react-redux'
import SidebarLink from "./SidebarLink"
import { useNavigate } from 'react-router-dom'
import { VscSignOut } from 'react-icons/vsc'
import ConfirmationModal from "../../common/ConfirmationModal"
import { useState } from "react"

const Sidebar = () => {

  const {user,loading:profileLoading} = useSelector((state) => state.profile);
  const {loading:authLoading} = useSelector((state) => state.auth);
  const dispatch = useDispatch() ;
  const navigate = useNavigate() ;
  const [confirmationModal, setConfirmationModal] = useState(null);

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
        Loading...
      </div>
    )
  }
   // Agar loading false hai (yaani loading complete ho chuki hai), tabhi sidebar dikhao
  return (
    <div>
      <div className='flex min-w-[222px] flex-col border-r-1px border-richblack-700 h-[calc(100vh-3.5rem)] bg-richblack-800 py-10'>
        <div className='flex felx-col'>
          {
            sidebarLinks.map( (element,index) =>{
              //agar joh humne element ka type share kiya h agar voh exist krta h -->(element.type) && user k accountType ko check kro element k type se 
              //isnhot::-> Agar element ka type exist karta hai, toh check karo kya user ka accountType us type ke equal hai
              if(element.type && user.accountType !== element.type)
                return null ; //agar voh equal nai h

              // Agar match hota hai, tabhi SidebarLink component render karo
              return(
                <SidebarLink key={element.id} element={element} iconName ={element.icon}/>
              )
            })
          }

        </div>

        <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-600'></div>
        
        <div className='flex flex-col'>
          <SidebarLink
            link={{name:"Settings" , path:"dashboard/seetings"}}
            iconName={"VscSettingsGear"}
          />

          {/* button ko click krnepr */}
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            } className="px-8 py-2 text-sm font-medium text-richblack-300"
            >
              <div className="flex items-center gap-x-2">
              <VscSignOut className="text-lg" />
              <span>Logout</span>
            </div>
            </button>
        </div>
      </div>
        {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}

export default Sidebar
