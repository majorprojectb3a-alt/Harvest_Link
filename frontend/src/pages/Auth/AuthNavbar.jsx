import { Link, useLocation } from "react-router-dom";
// import logo from "./assets/logo.jpg";
import './Auth.css';

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isBuyer = path.startsWith("/buyer");
  const isFarmer = path.startsWith("/farmer");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <img src={logo} alt="Logo" className="logo" /> */}
        <span className="brand">HarvestLink</span>
      </div>

      <div className="navbar-right">
        {/* On Buyer's page → show Farmer */}
        {isBuyer && (
          <Link to="/farmer" className="nav-link">
            Farmer Signup/Login
          </Link>
        )}

        {/* On Farmer page → show Buyer */}
        {isFarmer && (
          <Link to="/buyer" className="nav-link">
            Buyer Signup/Login
          </Link>
        )}

        {/* On / or /login → show Buyer by default */}
        {!isBuyer && !isFarmer && (
          <Link to="/buyer" className="nav-link">
            Buyer Signup/Login
          </Link>
        )}
      </div>
    </nav>
  );
}