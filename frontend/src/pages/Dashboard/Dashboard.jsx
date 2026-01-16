import React from "react";
import Header from "../../components/Header/Header";
import OptionCard from "../../components/OptionCard/OptionCard";
import buyFreshImg from "../../assets/buy_fresh.png";
import buyWasteImg from "../../assets/buy_waste.png";
import "./Dashboard.css";

const Dashboard = () =>{
    return (
        <div className = "dashboard-page">
        <Header />
        <div>
            <div className="dashboard-body">
                <div className="Options">
                    <OptionCard title="Buy Fresh" image={buyFreshImg} path="/buy-fresh" />
                    <OptionCard title="Buy Waste" image={buyWasteImg} path="/buy-waste" />
                </div>
            </div>
        </div>
        </div>
    )
}

export default Dashboard;