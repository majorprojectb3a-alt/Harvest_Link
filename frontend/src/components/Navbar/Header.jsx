import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = () =>{
    const navigate = useNavigate();

    const handleClick = (path) =>{
        navigate(path);
    }

    return (
        <header className="header">
            <div className="header-left">
                <h3>HarvestLink</h3>
            </div>

            <div className="header-right">
                <a href="#">Home</a>
                <a href="#">Contact</a>
                <span className="profile-icon" onClick = {() =>{handleClick("/edit-profile")}}>👤</span>
                <button className="signout-btn">Sign Out</button>
            </div>
        </header>
    );
};

export default Header;