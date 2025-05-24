//icon , bg colour , vertical yellow colour ,text , click toh path mh ja rhe ho

import React from 'react'
//*means all ..... /vsc is the prefix u can c in dashboard-links for icons 
import * as Icons from "react-icons/vsc" ;
import { useDispatch } from 'react-redux';
import { matchPath, NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const SidebarLink = ({element , iconName}) => {
    const Icon = Icons[iconName] ;
    
    //location hook isliye bcoz thaki hume pata chale ki konsa link click ho rha h jisse hum uska bg colour yellow kr skte ya uska colour nrml he rahe 
    const Location = useLocation();

    const dispatch = useDispatch() ;

    const matchRoute = (route) =>{
        return matchPath({path:route} , location.pathname) ;
    }

  return (
   <NavLink 
    to = {element.path} //click karoge iss path mh leke ja rha h 

    onClick={() => dispatch(resetCourseState())}
    
    /* agar routematch hua toh bg yellow  */
    className = {`${matchRoute(element.path) ? "bg-yellow-800" : "bg-opacity-0"}`}>

    {/* left side yellow vertical line border type--> yh bhi tbhi he visible hoga jbh hum uss route pr clck krenge means matchRoute */}
    <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(element.path) ? "opacity-100" : "opacity-0"
        }`}>

    </span>

    {/* name */}
    <div className='flex items-center gap-x-2'>
        <Icon className="text-lg"/>
        <span>{element.name}</span>
    </div>


   </NavLink>
  )
}

export default SidebarLink
