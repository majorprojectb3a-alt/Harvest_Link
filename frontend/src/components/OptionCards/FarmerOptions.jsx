import "./Options.css";
import Card from "../Card/Card";
import {useNavigate} from "react-router-dom";
import fresh from "../../assets/fresh.jpg"
import waste from "../../assets/waste.webp"
import predict from "../../assets/predict.png"
import React from 'react';
function Options() {
    const navigate = useNavigate();
    const options = [
        {image: fresh, title:"Sell Fresh", path: "/sell-fresh"},
        {image: waste, title:"Sell Waste", path: "/sell-waste"},
        {image: predict, title:"Predict Price", path: "/predict-price"}
    ];

    const handleClick = (path) => {
        navigate(path);
    };

    return (
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

export default Options;