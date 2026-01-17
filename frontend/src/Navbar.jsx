import { Link, useLocation } from "react-router-dom";
import logo from "./assets/logo.jpg";

export default function Navbar() {
  const location = useLocation();

  const isCustomer = location.pathname.includes("customer");
  const isFarmer = location.pathname.includes("farmer");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="logo" />
        <span className="brand">HarvestLink</span>
      </div>

      <div className="navbar-right">
        {isCustomer && (
          <Link to="/farmer" className="nav-link">
            Farmer Signup/Login
          </Link>
        )}

        {isFarmer && (
          <Link to="/customer" className="nav-link">
            Customer Signup/Login
          </Link>
        )}
      </div>
    </nav>
  );
}
