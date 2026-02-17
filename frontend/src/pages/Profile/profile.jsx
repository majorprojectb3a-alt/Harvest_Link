import "./Profile.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import defaultProfile from "../../assets/default_profile_image.png";

function Profile() {

    const [profile, setProfile] = useState(null);

    const [wasteItems, setWasteItems] = useState([]);

    const [purchaseHistory, setPurchaseHistory] = useState([]);

    const fetchFarmerData = async () => {

    const res = await axios.get(
        "http://localhost:5000/waste/my",
        { withCredentials: true }
    );

    setWasteItems(res.data.items);

};


const fetchBuyerData = async () => {

    const res = await axios.get(
        "http://localhost:5000/waste/buyer/history",
        { withCredentials: true }
    );

    setPurchaseHistory(res.data.items);

};


const fetchProfile = async () => {

    try {

        const res = await axios.get(
            "http://localhost:5000/auth/profile",
            { withCredentials: true }
        );

        setProfile(res.data.user);

        if (res.data.user.role === "farmer") {

            fetchFarmerData();

        } else {

            fetchBuyerData();

        }

    }
    catch(err){

        console.log(err);

    }

};

    useEffect(() => {
        fetchProfile();
    }, []);



    if (!profile) return <div>Loading...</div>;


    return (


        <div className="profile-container">

            <Navbar/>

            <div className="profile-card">

                <img
                    src={
                        profile.profileImage || defaultProfile
                    }
                    className="profile-image"
                    alt="profile"
                />

                <h2>{profile.name}</h2>

                <p>{profile.email}</p>

                <p>{profile.phone}</p>

                <p className="role">
                    Role: {profile.role}
                </p>

            </div>


            {/* FARMER VIEW */}

            {profile.role === "farmer" && (

                <div className="farmer-section">

                    <h3>Carbon Credits</h3>

                    <p>
                        🌱 Credits:
                        {profile.totalCarbonCredits?.toFixed(3) || 0}
                    </p>


                    <h3>Your Waste Listings</h3>

                    {wasteItems.length === 0
                        ? "No items listed"
                        :
                        wasteItems.map(item => (

                            <div
                                key={item._id}
                                className="waste-card"
                            >

                                <p>Type: {item.type}</p>

                                <p>Weight: {item.weight} kg</p>

                                <p>Status: {item.status}</p>

                            </div>

                        ))
                    }

                </div>

            )}


            {/* BUYER VIEW */}

            {profile.role === "customer" && (

                <div className="buyer-section">

                    <h3>Purchase History</h3>

                    {purchaseHistory.length === 0
                        ? "No purchases yet"
                        :
                        purchaseHistory.map(item => (

                            <div
                                key={item._id}
                                className="waste-card"
                            >

                                <p>Type: {item.type}</p>

                                <p>Weight: {item.weight} kg</p>

                                <p>Price: ₹{item.pricePerKg}/kg</p>

                            </div>

                        ))
                    }

                </div>

            )}

        </div>

    );

}

export default Profile;
