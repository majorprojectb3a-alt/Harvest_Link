import React, { useState, useEffect } from "react";
import Header from "../../components/Navbar/Header";
import "./EditProfile.css";
import defaultProfile from "../../assets/default_profile_image.png";
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries';

const EditProfile = () => {
    // const usStates = State.getStatesOfCountry('US');
    const gettingCountries = async ()=>{
        await getCountries();
    }
    const [formData, setFormData] = useState({
        companyName: "",
        buyerName: "",
        email: "",
        phone: "",
        accountType: "",
        city: "",
        state: "",
        industryType: "",
        interests: [],
        quantity: "",
        pickup: false,
        profileImage: null,
        imagePreview: defaultProfile,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchedData = {
        companyName: "Company ABC",
        buyerName: "Yahnavi",
        email: "yahnaviarja@gmail.com",
        phone: "9177612989",
        accountType: "buyer",
        city: "Bhimavaram",
        state: "Andhra Pradesh",
        industryType: "Bio-fuel",
        interests: ["Waste"],
        quantity: "500",
        pickup: false,
        profileImage: null,
        imagePreview: defaultProfile,
        };

        setFormData(fetchedData);
        setInitialData(fetchedData);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        // Profile image
        if (type === "file") {
        const file = files[0];
        if (file) {
            setFormData({
            ...formData,
            profileImage: file,
            imagePreview: URL.createObjectURL(file),
            });
        }
    }

    // Multiple checkboxes (interests)
    else if (type === "checkbox" && name === "interests") {
        if (checked) {
            setFormData({
            ...formData,
            interests: [...formData.interests, value],
            });
        } else {
            setFormData({
            ...formData,
            interests: formData.interests.filter((item) => item !== value),
            });
        }
    }

    // Single checkbox
    else if (type === "checkbox") {
        setFormData({
            ...formData,
            [name]: checked,
        });
    }

    // Normal inputs
    else {
        setFormData({
            ...formData,
            [name]: value,
        });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert("Profile updated successfully!");
        setInitialData(formData);
        setIsEditing(false);
    };

    const isFormChanged = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

    return (
        <>
        <Header />
        <p>{gettingCountries()}</p>
        <div className="edit-profile-page">
            <div className="edit-profile-container">
            <h1>Edit Profile</h1>

            <form onSubmit={handleSubmit} className="edit-profile-form">

                {/* Profile Image */}
                <div className="profile-image-section">
                    <img src={formData.imagePreview} alt="Profile Preview" className="profile-preview"/>
                    <input type="file" name="profileImage" accept="image/*" onChange={handleChange} disabled={!isEditing}/>
                </div>

                {/* Personal Details */}
                <div className="personal-details">
                    <h2>Personal Details</h2>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} disabled={!isEditing}/>
                    </div>

                    <div className="form-group">
                        <label>Buyer Name</label>
                        <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} disabled={!isEditing}/>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing}/>
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing}/>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing}/>
                        </div>

                        <div className="form-group">
                            <label>State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} disabled={!isEditing}/>
                        </div>
                    </div>
                </div>

                {/* Business Details */}
                <div className="business-details">
                    <h2>Business Details</h2>

                    <div className="form-group">
                        <label>Industry Type</label>
                        <select name="industryType" value={formData.industryType} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select</option>
                            <option value="Bio-fuel">Bio-fuel</option>
                            <option value="Biogas">Biogas</option>
                            <option value="Composting">Composting</option>
                            <option value="Food Processing">Food Processing</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Interested In</label>
                        <div className="checkbox-group">
                            <label>
                                <input type="checkbox" name="interests" value="Fresh" checked={formData.interests.includes("Fresh")} onChange={handleChange} disabled={!isEditing}/>
                                Fresh Produce
                            </label>

                            <label>
                                <input type="checkbox" name="interests" value="Waste" checked={formData.interests.includes("Waste")} onChange={handleChange} disabled={!isEditing}/>
                                Waste
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                        <input type="checkbox" name="pickup" checked={formData.pickup} onChange={handleChange} disabled={!isEditing}/>
                        I can arrange transportation for pickup
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="button-group">
                {!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                    </button>
                ) : (
                    <>
                    <button type="submit" disabled={!isFormChanged}>
                        Save Changes
                    </button>
                    <button type="button" onClick={() => { setFormData(initialData); setIsEditing(false); }}>
                        Cancel
                    </button>
                    </>
                )}
                </div>

            </form>
            </div>
        </div>
        </>
    );
};

export default EditProfile;
