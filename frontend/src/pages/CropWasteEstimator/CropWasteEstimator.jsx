import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./CropWasteEstimator.css";

export default function CropWasteEstimator() {
  const [form, setForm] = useState({
    crop: "wheat",
    region: "india",
    harvested_kg: 1000,
    rpr: 1.3,
    moisture_frac: 0.15,
    LHV_MJ_per_kg: 15.0,
    price_per_liter: 50
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
        "http://localhost:5000/api/estimator/estimate",
        {
          crop: form.crop,
          region: form.region,
          harvested_kg: Number(form.harvested_kg),
          rpr: Number(form.rpr),
          moisture_frac: Number(form.moisture_frac),
          LHV_MJ_per_kg: Number(form.LHV_MJ_per_kg),
          energy_per_liter: 36.0
        },
        { withCredentials: true }
      );

      const est = res.data;
      est.estimated_value =
        est.predicted_liters * Number(form.price_per_liter);

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
                <label>Crop</label>
                <select name="crop" value={form.crop} onChange={handleChange}>
                    <option value="rice">Rice</option>
                    <option value="wheat">Wheat</option>
                    <option value="maize">Maize</option>
                    <option value="sugarcane">Sugarcane</option>
                    <option value="cotton">Cotton</option>
                    <option value="banana">Banana</option>
                </select>
            </div>

            <div className="form-group">
                <label>Country</label>
                <input
                    type="text"
                    name="region"
                    value="India"
                    disabled
                />
            </div>

            <div className="form-group">
                <label>Harvested Amount (kg)</label>
                <input
                type="number"
                name="harvested_kg"
                value={form.harvested_kg}
                onChange={handleChange}
                />
            </div>

          <div className="form-group">
            <label>Residue-to-Product Ratio (RPR)</label>
            <input
              type="number"
              step="0.01"
              name="rpr"
              value={form.rpr}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Moisture Fraction (0–1)</label>
            <input
              type="number"
              step="0.01"
              name="moisture_frac"
              value={form.moisture_frac}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>LHV (MJ/kg)</label>
            <input
              type="number"
              step="0.1"
              name="LHV_MJ_per_kg"
              value={form.LHV_MJ_per_kg}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Price per Liter (₹)</label>
            <input
              type="number"
              name="price_per_liter"
              value={form.price_per_liter}
              onChange={handleChange}
            />
          </div>

          <button className="predict-btn" onClick={submit}>
            Estimate Biofuel Value
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="result-box">
            <h3>Prediction Results</h3>
            <p>
              <strong>Predicted Biofuel:</strong>{" "}
              {result.predicted_liters.toFixed(2)} liters
            </p>
            <p>
              <strong>Baseline Biofuel:</strong>{" "}
              {result.baseline_liters.toFixed(2)} liters
            </p>
            <p>
              <strong>Estimated Market Value:</strong> ₹
              {result.estimated_value.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
