import { useState, useEffect } from "react";
import axios from "axios";
import "./FreshForm.css";
import { CROP_FRESH_TYPES } from "../../constants/cropFreshTypes";
import {DISTRICTS} from "../../constants/Districts";
import {MARKETS} from "../../constants/Markets";

function FreshForm({ onClose }) {

  const [form, setForm] = useState({
    crop: "",
    kg: "",
    grams: "",
    price: "",
    totalPrice: "",
    state: "Andhra Pradesh",
    district: "",
    mandi: "",
  });

  const [location, setLocation] = useState({ lat: null, lng: null });

  // GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        alert("Location access is required to sell waste");
      }
    );
  }, []);

  // HANDLE INPUT CHANGE (KG + GRAMS LOGIC)
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    const kg = Number(updated.kg) || 0;
    const grams = Number(updated.grams) || 0;
    const totalWeight = kg + grams / 1000;   // CONVERT TO KG

    // AUTO CALCULATE PRICE
    if (totalWeight > 0 && updated.price) {
      updated.totalPrice =
        (totalWeight * Number(updated.price)).toFixed(2);
    } else {
      updated.totalPrice = "";
    }

    setForm(updated);
  };

  // SUBMIT FORM
  const handleSubmit = async () => {
    if (!form.crop || (!form.kg && !form.grams) || !form.price) {
      alert("Please fill all fields");
      return;
    }

    if (!location.lat || !location.lng) {
      alert("Location not detected yet");
      return;
    }

    const totalWeight =
      Number(form.kg || 0) + Number(form.grams || 0) / 1000;

    try {
      await axios.post(
        "http://localhost:5000/fresh/add",
        {
            crop: form.crop,
            weight: totalWeight,
            price: form.price,
            totalPrice: form.totalPrice,
            state: form.state,
            district: form.district,
            mandi: form.mandi,
            lat: location.lat,
            lng: location.lng
        },
        { withCredentials: true }
      );

      alert("✅ Item added successfully");
      onClose();

    } catch (err) {
      console.log(err);
      alert("❌ Failed to add fresh crop item");
    }
  };

  return (
    <div className="fresh-item-form">
      <h2> Add Fresh Crop Item</h2>

      {/* TYPE */}
      <select
        name="crop"
        value={form.crop}
        onChange={handleChange}
      >
        <option value="">Select Crop Fresh Type</option>
        {CROP_FRESH_TYPES.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* WEIGHT INPUT: KG + GRAMS */}
      <div className="weight-row">
        <input
          name="kg"
          type="number"
          placeholder="Kg"
          min="0"
          onChange={handleChange}
        />

        <input
          name="grams"
          type="number"
          placeholder="Grams"
          min="0"
          max="999"
          onChange={handleChange}
        />
      </div>

      {/* PRICE PER KG */}
      <input
        name="price"
        type="number"
        placeholder="Price per kg (₹)"
        onChange={handleChange}
      />

        <input
        name="state"
        type="text"
        placeholder="State"
        value="Andhra Pradesh"
        readOnly
        onChange={handleChange}
      />
        <select
        name="district"
        value={form.district}
        onChange={handleChange}
      >
        <option value="">Select State</option>
        {DISTRICTS.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

        {/* <input
        name="district"
        type="text"
        placeholder="District"
        onChange={handleChange}
      /> */}

        <select
        name="mandi"
        value={form.mandi}
        onChange={handleChange}
      >
        <option value="">Select Mandi name</option>
        {MARKETS.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {/* <input
        name="mandi"
        type="text"
        placeholder="Mandi"
        onChange={handleChange}
      /> */}

      {/* TOTAL PRICE */}
      <div className="price-box">
        💰 Total Price: ₹{form.totalPrice || 0}
      </div>

      {/* ACTION BUTTONS */}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="add-btn" onClick={handleSubmit}>
          ➕ Add Item
        </button>
      </div>
    </div>
  );
}

export default FreshForm;
