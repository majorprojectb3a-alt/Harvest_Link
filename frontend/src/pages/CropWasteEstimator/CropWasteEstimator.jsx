import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./CropWasteEstimator.css";

export default function CropWasteEstimator() {
  const [form, setForm] = useState({
    crop_waste: "Rice Husk",
    waste_quantity: 1,
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/estimator/crop-to-biofuel",
        {
          crop_waste: form.crop_waste,
          waste_quantity: form.waste_quantity
        },
        { withCredentials: true }
      );

      const est = res.data;
  
      setResult(est);
    } catch (err) {
      setError("Estimation failed. Please check inputs.");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="predictor-container">
        <h2>Crop Waste → Biofuel Estimator</h2>

        <div className="predictor-form">
            <div className="form-group">
                <label>Crop Waste</label>
                <select name="crop_waste" value={form.crop_waste} onChange={handleChange}>
                    <option value="Rice Husk">Rice Husk</option>
                    <option value="Rice Straw">Rice Straw</option>
                    <option value="Wheat Straw">Wheat Straw</option>
                    <option value="Sugarcane Bagasse">Sugarcane Bagasse</option>
                    <option value="Corn Stover">Corn Stover</option>
                    <option value="Sunflower Husk">Sunflower Husk</option>
                    <option value="Soybean Straw">Soybean Straw</option>
                    <option value="Sugarcane Straw">Sugarcane Straw</option>
                    <option value="Maize Stover">Maize Stover</option>
                </select>
            </div>

          <div className="form-group">
            <label>Quantity of waste (in kgs)</label>
            <input
              type="number"
              step="0.1"
              name="waste_quantity"
              value={form.waste_quantity}
              onChange={handleChange}
            />
          </div>

          <button className="predict-btn" onClick={submit}>
            Estimate Biofuel Quantity
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {result && (
          <div className="result-box">
            <h3>Prediction Results</h3>
            <p>
              <strong>Predicted Biofuel:</strong>{" "}
              {result.biofuel_type}
              
            </p>
            <p>
              <strong>Quantity of Biofuel:</strong>{" "}
              {result.biofuel_produced_liters}{" "}{result.units}
            </p>
          </div>

        )
        }
      </div>
    </>
  );
}
