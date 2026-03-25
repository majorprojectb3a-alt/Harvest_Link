import "./Navbar.css";
import { FiLogOut, FiBell, FiBellOff  } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default_profile_image.png";
import { Link } from "react-router-dom";

function Navbar() {
  const [profile, setProfile] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();

  const navigate = useNavigate();

    useEffect(() =>{
        axios.get("http://localhost:5000/auth/profile", {withCredentials: true}).then(res =>{
          // console.log(res.data.user);
            setProfile(res.data.user);
            setNotificationsEnabled(res.data.user.notifyOnNearbyProducts ?? true);
            // console.log(profile);
        })
        .catch(()=>{
            navigate("/");
        });
    }, []);

    useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = async () => {
  try {
    const newValue = !notificationsEnabled;

    setNotificationsEnabled(newValue);

    await axios.put(
      "http://localhost:5000/auth/update-profile",
      { notifyOnNearbyProducts: newValue },
      { withCredentials: true }
    );

  } catch (err) {
    console.error(err);
  }
};

  const logout = async () => {
    await axios.post(
      "http://localhost:5000/auth/logout",
      {},
      { withCredentials: true }
    );
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="nav">
      {/* Left side: Logo */}
      <div className="logo">
        <Link to={profile?.role === "farmer" ? "/FarmerHome" : "/BuyerHome"} onClick={() => setShowDropdown(false)} >
        HarvestLink
        </Link>
      </div>

       <div className="right">

        {profile?.role === "buyer" && 
        <div className="notification-toggle" onClick={toggleNotifications} title={notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}>
          {notificationsEnabled ? (
            <FiBell className="bell-icon active"/>
          ) : (
            <FiBellOff className="bell-icon inactive"/>
          )}
        </div>
        }

        {/* PROFILE + DROPDOWN */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <img
            src={
              profile?.profileImage && profile.profileImage !== ""
                ? profile.profileImage
                : defaultProfile
            }
            alt="Profile"
            className="profile-img"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {showDropdown && (
            <div className="dropdown-menu">

              <div className="dropdown-header">
                <p className="dropdown-name">{profile?.name}</p>
                <p className="dropdown-role">{profile?.role}</p>
              </div>

              <div className="dropdown-divider"></div>

              <Link
                to={profile?.role === "farmer" ? "/FarmerHome" : "/BuyerHome"}
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Home
              </Link>

              <Link
                to="/booking-requests"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Booking Requests
              </Link>

              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Profile
              </Link>

              <div className="dropdown-divider"></div>

              <div className="dropdown-item logout-item" onClick={logout}>
                <FiLogOut />
                <span>Logout</span>
              </div>

            </div>
          )}
        </div>
        {/* <div className="logout" onClick={logout}>
          <FiLogOut className="logout-logo" title="Logout" />
          <p>LogOut</p>
        </div> */}
      </div>
    </nav>
  );
}

export default Navbar;