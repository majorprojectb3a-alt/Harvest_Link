import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Card/Card";
import "./Options.css";
import buyFreshImg from "../../assets/fresh.jpg";
import buyWasteImg from "../../assets/waste.webp";

const OptionCard = () =>{
    const navigate = useNavigate();

    const handleClick = (path) =>{
        navigate(path);
    }

    const options = [
        {image: buyFreshImg, title:"Buy Fresh", path: "/buy-fresh"},
        {image: buyWasteImg, title:"Buy Waste", path: "/buy-waste"},
    ];

    return(
        <section className="options">
            <div className="items">
                {options.map((item, index) => (
                    <div onClick = {() =>handleClick(item.path)}>
                    <Card key={index} image={item.image} title={item.title} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default OptionCard;