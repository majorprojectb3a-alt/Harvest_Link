import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import './Unauthorized.css';
import { useEffect, useState } from "react";
import axios from "axios";

export default function Unauthorized() {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(()=>{
        console.log('inside use effect');
        axios.get("http://localhost:5000/auth/profile",{
            withCredentials: true,
        }).then((res)=>{
            setRole(res.data.user.role);
        }).catch(()=>{
            setRole(null);
        })
    }, []);

    const goBack = ()=>{
        console.log(role);
        if(role == "farmer")
            navigate("/FarmerHome", {replace: true})
        else if(role == "buyer")
            navigate("/BuyerHome", {replace: true})
        else
            navigate("/", {replace: true})
    };

    return (
        <>
            <Navbar />
            <div className="unauthorized-body">
                <div>
                    <h2>403- Unauthorized</h2>
                    <p>You cannot access this page.</p>
                    <button className = "go-back-btn" onClick={goBack}>Go Back</button>
                </div>
            </div>
        </>
    )
}