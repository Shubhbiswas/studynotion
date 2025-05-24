import "./App.css";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar.jsx" ; 
import Signup from "./pages/Signup.jsx" ;
import Login from "./pages/Login.jsx";
import OpenRoute from "./components/core/Auth/OpenRoute"
import ForgotPassword from "./pages/ForgotPassword.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import About from "./pages/About.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Contact from "./pages/Contact.jsx";



function App() {
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path ="signup" 
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }
        />
        <Route 
          path ="login" 
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />  

         <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />  

        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />  

        
        <Route
          path="/about"
          element={
              <About />
          }
        />

        <Route
          path="/contact" 
          element={<Contact />} 
        />

        <Route 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
        <Route path="dashboard/my-profile" element={<MyProfile />} />
      
        <Route path="dashboard/Settings" element={<Settings />} />
      
        </Route>

      </Routes>
    </div>
  );
}

export default App;
