import React, {useState} from "react";
import Header from "../../components/Header/Header";
import "./EditProfile.css";

const EditProfile = () =>{
    const [fromData, setFormData] = useState({
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
        pickUp: false,
    });

    const handleChange = (e) =>{
        const {name, value, type, checked} = e.target;

        if(type === "checkbox" && name === "interests"){
            if(checked){
                setFormData({
                    ...formData,
                    interests: [...formData.interests, value],
                })
            }
            else{
                setFormData({
                    ...formData, interests: formData.interests.filter((item) =>{
                        item !== value;
                    }),
                })
            }
        }
        else if(type === "checkbox"){
            setFormData({...fromData, [name]: checked},);
        }
        else{
            setFormData({...formData, [name]: value});
        }
    };

    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log(formData);
        alert('form submitted successfully');
    }
    return( 
        <div className="edit profile-page">
            <Header />
            <div className="edit-profile-container">
                <h1>Edit Profile Page</h1>
                <form onSubmit={handleSubmit} className="edit-profile-form"> 
                <div className="personal-details">
                    <h2>Personal Details</h2>
                    <div className="form-group">
                        <label htmlFor="company-name">Company Name: </label>
                        <input type="text" name="company-name" id="company-name" onChange = {handleChange} placeholder="Company Name" required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="buyer-name">Buyer Name: </label>
                        <input type="text" name="buyer-name" id="buyer-name" onChange = {handleChange} placeholder="Name" required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email-id">Email Id: </label>
                        <input type="email" name="email-id" id="email-id" placeholder="email" onChange = {handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone-number">Phone Number: </label>
                        <input type="tel" name="phone-number" id="phone-number" placeholder="Mobile Number" onChange = {handleChange} required/>                    
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phone-number">Account Type: </label>
                        <input type="text" name="account-type" id="account-type" placeholder="Buyer" onChange = {handleChange} required/>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                        <label>City</label>
                        <input type="text" name="city" onChange={handleChange} />
                        </div>

                        <div className="form-group">
                        <label>State</label>
                        <input type="text" name="state" onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <div className="business-details">
                    <h2>Business Details</h2>
                    <div className="form-group">
                        <label htmlFor="industryType">Industry Type: </label>
                        <select name="industryType"  onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Bio-fuel">Bio-fuel</option>
                            <option value="Biogas">Biogas</option>
                            <option value="Composting">Composting</option>
                            <option value="Food Processing">Food Processing</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="interest">Interested In: </label>
                        <div className="checkbox-group">
                            <label>
                                <input type="checkbox" name="interests" id="interests" value="Fresh" onChange={handleChange} />
                                Fresh Produce
                            </label>

                            <label>
                                <input type="checkbox" name="interests" id="interests" value="Waste" onChange={handleChange} />
                                Waste
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" name="pickup" id="pickup" onChange={handleChange}/>
                            I can arrange transportation for pickup...
                        </label>
                    </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;