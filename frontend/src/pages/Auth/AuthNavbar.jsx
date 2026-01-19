import { Link, useLocation } from "react-router-dom";
// import logo from "./assets/logo.jpg";
import './Auth.css';

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isCustomer = path.startsWith("/customer");
  const isFarmer = path.startsWith("/farmer");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <img src={logo} alt="Logo" className="logo" /> */}
        <span className="brand">HarvestLink</span>
      </div>

      <div className="navbar-right">
        {/* On Customer page → show Farmer */}
        {isCustomer && (
          <Link to="/farmer" className="nav-link">
            Farmer Signup/Login
          </Link>
        )}

        {/* On Farmer page → show Customer */}
        {isFarmer && (
          <Link to="/customer" className="nav-link">
            Customer Signup/Login
          </Link>
        )}

        {/* On / or /login → show Customer by default */}
        {!isCustomer && !isFarmer && (
          <Link to="/customer" className="nav-link">
            Customer Signup/Login
          </Link>
        )}
      </div>
    </nav>
  );
}
