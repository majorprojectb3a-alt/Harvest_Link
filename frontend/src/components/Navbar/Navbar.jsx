import './Navbar.css';
import { FaUserCircle} from "react-icons/fa";
import {FiLogOut} from "react-icons/fi"
import { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logo.png";
import defaultProfile from "../../assets/default_profile_image.png";

function Navbar () {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() =>{
        axios.get("http://localhost:5000/api/auth/profile", {withCredentials: true}).then(res =>{
            setProfile(res.data.user);
        })
        .catch(()=>{
            navigate("/");
        });
    }, []);

    const logout = async () =>{
        await axios.post("http://localhost:5000/api/auth/logout", {}, {withCredentials: true});
        navigate("/");
    }
    return (
        <nav className='nav'>
            <div className='logo'>
                
                <img src={logo} alt="logo" />
            </div>

            <div className='right'>
                <div className="username-div">
                    <span className="username">
                        {profile?.name}
                    </span>
                </div>
                    <img src={profile?.profileImage && profile.profileImage !== "" ? profile.profileImage: defaultProfile} alt="Profile" className="profile-img"/>
                <div className = "logout-div" onClick={logout}>
                    <FiLogOut className="logout-logo" title="Logout"/>
                    {/* <p>LogOut</p> */}
                </div>
            </div>

        </nav>
    );
}

export default Navbar;