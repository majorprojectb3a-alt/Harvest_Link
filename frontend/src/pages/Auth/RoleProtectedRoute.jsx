import {Navigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios  from "axios";

export default function RoleProtectedRoute({allow, children}){
    const [status, setStatus] = useState("loading");

    useEffect(()=>{
        axios.get("http://localhost:5000/auth/profile", {
            withCredentials: true
        }).then(
            res =>{
                const role = res.data.user.role;

                if(allow.includes(role)){
                    setStatus("ok");
                }
                else{
                    // alert("You are not authorized to access this page");
                    setStatus("denied");
                }
            }).catch(()=>{
                setStatus("denied");
            })
    }, []);

    if(status == "loading")
        return <div>Checking access...</div>;
    if(status == "denied")
        return <Navigate to = "/unauthorized" />;

    return children;
}