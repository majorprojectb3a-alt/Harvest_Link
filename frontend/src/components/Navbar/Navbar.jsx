import "./Navbar.css";
import { FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default_profile_image.png";

function Navbar() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/profile", { withCredentials: true })
      .then((res) => {
        setProfile(res.data.user);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const logout = async () => {
    await axios.post(
      "http://localhost:5000/api/auth/logout",
      {},
      { withCredentials: true }
    );
    navigate("/");
  };

  return (
    <nav className="nav">
      {/* Left side: Logo */}
      <div className="logo">HarvestLink</div>

      {/* Right side: Home → Contact → Username → Profile → Logout */}
      <div className="right">
        <ul className="nav-links">
          <li>
            <a href="/FarmerHome">Home</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>

        <span className="username">{profile?.name}</span>

        <img
          src={
            profile?.profileImage && profile.profileImage !== ""
              ? profile.profileImage
              : defaultProfile
          }
          alt="Profile"
          className="profile-img"
        />

        <div className="logout" onClick={logout}>
          <FiLogOut className="logout-logo" title="Logout" />
          <p>LogOut</p>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
