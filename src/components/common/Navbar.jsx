import React, { useEffect } from 'react'
import { Link,matchPath } from 'react-router-dom'
import logo from "../../assets/LOGO/Logo-Full-Light.png"
import { NavbarLinks } from '../../data/navbar-link'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CiShoppingCart } from "react-icons/ci";
import ProfileDropDown from "../core/Auth/ProfileDropDown" ;
import { apiConnector } from '../../services/apiconnector'
import { categories } from '../../services/api'
import {useState} from "react" ;
import { TiArrowSortedDown } from "react-icons/ti";

const Navbar = () => {

//yaha token ko desturcture krk nikala h ..hum token ko auth k slice se nikal rhe h isliye state.auth lkha h
  const {token} = useSelector( (state) => state.auth);
  //yaha user ko nikala h profile k andhr se 
  const {user} = useSelector( (state) => state.profile);
  //yaha totalItmes ko nikala h cart k andhr se isliye state.cart likha h
  const {totalItems} = useSelector( (state) => state.cart);

  const[subLinks , setSubLinks] = useState([]) ;

  const fetchSubLinks = async() =>{
    try{
      const result = await apiConnector("GET" , categories.CATEGORIES_API);
      console.log("printing the subLinks result" , result) ;
      setSubLinks(result) ;
    }
    catch(error){
      console.log("couldn't fetch the catalog details")
    }
  }

  //useeffect to call the API 
  useEffect( () =>{
    console.log("PRINTING TOKEN" , token)
    fetchSubLinks() ;
  },[] )


  const location = useLocation() ; // isse hume current URL ka location object milta hai

  // matchRoute function check karta hai ki kya current URL (location.pathname)
  // kisi specific route path (element.path) se match karta hai
  const matchRoute = (route) => {
    // location.pathname = current URL path (e.g., "/about")
    // route = path from NavbarLinks (e.g., "/about")
    return matchPath({ path: route }, location.pathname);
  }

  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
      <div className='flex w-11/12 max-w-maxContent items-center justify-between'>

      {/* Add Image */}
        <Link to="/">
            <img src={logo} width={160} height={42} loading='lazy'/>
        </Link>

        {/* Nav Links */}
        <nav>
          <ul className='flex gap-x-6 text-richblack-25'>
          {
            NavbarLinks.map( (element , index) =>(
              <li key={index}>
                {
                  //Agar element ka naam catalog h toh use alag se treat kar o or bhaki sbh k loye alag se treat karo ..
                  element.title === "Catalog" ?(
                    <div className=' relative flex items-center gap-2 group'>
                      <p>{element.title}</p>
                      <TiArrowSortedDown />

                      <div className='invisible absolute left-[50%] translate-x-[-50%]  translate-y-[80%] top-[50%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transiton-all duration-200 group-hover:visible group-hover:opacity-100 lg:w-[300px]'>
                        <div className='absolute left-[50%] top-0 translate-x-[80%] translate-y-[-45%] h-6 w-6 rotate-45 rounded bg-richblack-5'>

                        </div>
                      </div>
                    </div>
                  ) :(
                    //agar title naam catalog nai h toh simple jis pr clck hua h usk path mh leke jao joh oath se linked h 
                    <Link to ={element.path}>
                      {/* Agar current route is path se match karta hai toh yellow color, warna default */}
                      <p className={`${matchRoute(element?.path) ?"text-yellow-25":"text-richblack-25"}`}>{element.title}</p>
                    </Link>
                  )
                }
              </li>
            ))

          }
          </ul>
        </nav>

        {/* Login/SignUp/DashBoard */}
        <div className='flex gap-4 items-center'>
          {
            //cart create
            user && user.accountType != "Instructor" && (
              <Link to = "/dashboard/cart" className='relative'>
                <CiShoppingCart />
                {
                  totalItems > 0 && (
                    <span>{totalItems}</span>
                  )
                }
              </Link>
            )
          }
            {/*login and signup button if token is null-->means user is not loged in so show login n signup buttons  */}
          {
            token === null && (
              <Link to ="/login">
                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md ' >
                  Login
                </button>
              </Link>
            )
          }
           {/* Agar token null hai, toh SignUp button bhi dikhana hai */}
          {
            token === null && (
              <Link to ="/signup">
                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                  SignUp
                </button>
              </Link>
            )
          }

          {/*agar token null nai h means user is logged in toh user ka dashbard dikaho means profiledropdwon*/}
          {
            token!=null && <ProfileDropDown />
          }
        </div>




      </div>
    </div>
  )
}

export default Navbar
