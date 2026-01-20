import { useState, useEffect } from "react";
import axios from "axios";
import "./WasteForm.css";
import { CROP_WASTE_TYPES } from "../../constants/CropWasteTypes";

function WasteForm({ onClose }) {

  const [form, setForm] = useState({
    type: "",
    kg: "",
    grams: "",
    pricePerKg: "",
    predictedPrice: ""
  });

  const [location, setLocation] = useState({ lat: null, lng: null });

  // 🔥 GET USER LOCATION
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

  // 🔥 HANDLE INPUT CHANGE (KG + GRAMS LOGIC)
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    const kg = Number(updated.kg) || 0;
    const grams = Number(updated.grams) || 0;
    const totalWeight = kg + grams / 1000;   // 🔥 CONVERT TO KG

    // 🔥 AUTO CALCULATE PRICE
    if (totalWeight > 0 && updated.pricePerKg) {
      updated.predictedPrice =
        (totalWeight * Number(updated.pricePerKg)).toFixed(2);
    } else {
      updated.predictedPrice = "";
    }

    setForm(updated);
  };

  // 🔥 SUBMIT FORM
  const handleSubmit = async () => {
    if (!form.type || (!form.kg && !form.grams) || !form.pricePerKg) {
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
        "http://localhost:5000/api/waste/add",
        {
          type: form.type,
          weight: totalWeight,          // 🔥 STORE DECIMAL KG
          pricePerKg: form.pricePerKg,
          predictedPrice: form.predictedPrice,
          lat: location.lat,
          lng: location.lng
        },
        { withCredentials: true }
      );

      alert("✅ Item added successfully");
      onClose();

    } catch (err) {
      console.log(err);
      alert("❌ Failed to add waste item");
    }
  };

  return (
    <div className="waste-form">
      <h2>♻️ Add Waste Item</h2>

      {/* TYPE */}
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
      >
        <option value="">Select Crop Waste Type</option>
        {CROP_WASTE_TYPES.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* 🔥 WEIGHT INPUT: KG + GRAMS */}
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
        name="pricePerKg"
        type="number"
        placeholder="Price per kg (₹)"
        onChange={handleChange}
      />

      {/* TOTAL PRICE */}
      <div className="price-box">
        💰 Total Price: ₹{form.predictedPrice || 0}
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

export default WasteForm;
