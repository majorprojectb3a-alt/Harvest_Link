import "./Options.css";
import Card from "./Card";

import fresh from "../assets/fresh.jpg"
import waste from "../assets/waste.webp"
import predict from "../assets/predict.png"

function Options() {
    const options = [
        {image: fresh, title:"Sell Fresh"},
        {image: waste, title:"Sell Waste"},
        {image: predict, title:"Predict Price"}
    ];

    return (
        <section className="options">
            <div className="items">
                {options.map((item, index) => (
                    <Card key={index} image={item.image} title={item.title}/>
                ))}
            </div>
        </section>
    );
}

export default Options;