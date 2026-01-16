import React from "react";
import { useNavigate } from "react-router-dom";
import "./OptionCard.css";

const OptionCard = ({title, image, path}) =>{
    const navigate = useNavigate();

    const handleClick = () =>{
        navigate(path);
    }

    return(
        <div className="option-card" onClick={handleClick}>
            <img src={image} alt={title} className = "option-image" />
            <button className="option-title">{title}</button>
        </div>
    );
}

export default OptionCard;