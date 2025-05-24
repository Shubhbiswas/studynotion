//yh vala route ka mtlb h ki yh route ko sirf logged in vale users ko he access kr skte h
import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const{token} = useSelector((state) => state.auth);

    //agar token agar present h
    if(token !== null) //agar token null nai h toh route mh jane do bcoz usk pass token h ..token h means user login hua h
    {
        return children ;
    }
    else{//agar use k pass token nai h toh usse sbhse phele login hone bolo ..
        return <Navigate to="/login"/>
    }
}

export default PrivateRoute
