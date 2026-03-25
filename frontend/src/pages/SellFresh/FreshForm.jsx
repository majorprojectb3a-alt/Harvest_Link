import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Papa from "papaparse";
import "./FreshForm.css";
import { CROP_FRESH_TYPES } from "../../constants/cropFreshTypes";

function FreshForm({ onClose, item }) {

  const [form, setForm] = useState({
    crop: "",
    kg: "",
    grams: "",
    price: "",
    totalPrice: "",
    state: "Andhra Pradesh",
    district: "",
    mandi: ""
  });

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [mandisData, setMandisData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandiOptions, setMandiOptions] = useState([]);

  const [loadingMandis, setLoadingMandis] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [manualPriceMode, setManualPriceMode] = useState(false);
  const [priceLocked, setPriceLocked] = useState(false);

  /* ---------------- HANDLE INPUT ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    const kg = Number(updated.kg) || 0;
    const grams = Number(updated.grams) || 0;

    const totalWeight = kg + grams / 1000;

    if (["crop", "district", "mandi", "kg", "grams"].includes(name)) {
    updated.price = "";
    updated.totalPrice = "";
    setPrediction(null);
    setPriceLocked(false);
  }

    if (totalWeight > 0 && updated.price) {
      updated.totalPrice = (totalWeight * Number(updated.price)).toFixed(2);
    } else {
      updated.totalPrice = "";
    }

    setForm(updated);
  };

  /* ---------------- MANDI COORDS ---------------- */

  const getMandiCoords = (market, district, state) => {

    if (!market)
      return { lat: null, lng: null, source: null };

    const candidates = mandisData.filter(r =>
      r.state.toLowerCase() === state.toLowerCase() &&
      r.district === district &&
      r.market.trim().toLowerCase() === market.trim().toLowerCase()
    );

    if (!candidates.length)
      return { lat: null, lng: null, source: null };

    const any = candidates.find(x => x.lat != null && x.lng != null);

    if (any)
      return { lat: any.lat, lng: any.lng, source: any.source || null };

    return { lat: null, lng: null, source: null };
  };

  /* ---------------- DELETE ITEM ---------------- */

  const handleDelete = async () => {

    if (!item) return;

    if (!window.confirm("Are you sure you want to delete this item?"))
      return;

    try {

      await axios.delete(
        `http://localhost:5000/fresh/delete/${item._id}`,
        { withCredentials: true }
      );

      alert("Item deleted successfully");
      onClose();

    } catch (err) {

      console.log(err);
      alert("Failed to delete item");

    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {

    if (!form.crop || (!form.kg && !form.grams) || !form.price) {
      alert("Please fill all fields");
      return;
    }

    let chosenLat = null;
    let chosenLng = null;

    if (form.mandi) {

      const coords = getMandiCoords(
        form.mandi,
        form.district,
        form.state
      );

      if (coords.lat != null && coords.lng != null) {

        chosenLat = coords.lat;
        chosenLng = coords.lng;

      }
    }

    if (chosenLat == null || chosenLng == null) {
      alert("Cannot determine mandi coordinates.");
      return;
    }

    const totalWeight =
      Number(form.kg || 0) + Number(form.grams || 0) / 1000;

    setLoadingSubmit(true);

    try {

      const payload = {
        crop: form.crop,
        weight: totalWeight,
        price: form.price,
        totalPrice: form.totalPrice,
        state: form.state,
        district: form.district,
        mandi: form.mandi,
        lat: chosenLat,
        lng: chosenLng
      };

      if (item) {

        await axios.put(
          `http://localhost:5000/fresh/update/${item._id}`,
          payload,
          { withCredentials: true }
        );

        toast.success("Fresh Item updated successfully");
      } else {

        const res = await axios.post(
          "http://localhost:5000/fresh/add",
          payload,
          { withCredentials: true }
        );

        if (res.data.merged) {
          toast.info("Merged with existing item");
        } else {
          toast.success("Item added successfully");
        }
        // alert("Item added successfully");

      }

      onClose();

    } catch (err) {

      console.log(err);
      alert("Failed to save item");

    }

    setLoadingSubmit(false);
  };

  const isFormValid =
  form.crop &&
  (Number(form.kg) > 0 || Number(form.grams) > 0) &&
  form.district &&
  form.mandi &&
  Number(form.price) > 0;

  /* ---------------- LOAD ITEM ---------------- */

  useEffect(() => {

    if (!item) return;

    const kg = Math.floor(item.weight);
    const grams = Math.round((item.weight - kg) * 1000);

    setForm({
      crop: item.crop || "",
      kg,
      grams,
      price: item.price || "",
      totalPrice: item.totalPrice || "",
      state: item.state || "Andhra Pradesh",
      district: item.district || "",
      mandi: item.mandi || ""
    });

  }, [item]);

  /* ---------------- LOAD MANDIS CSV ---------------- */

  useEffect(() => {

    async function loadMandis() {

      try {

        const res = await axios.get("/mandis_geocoded.csv");

        const parsed = Papa.parse(res.data, {
          header: true,
          skipEmptyLines: true
        });

        const rows = parsed.data.map(r => ({
          state: r.state?.trim() || "",
          district: r.district?.trim() || "",
          market: r.market?.trim() || "",
          lat: r.lat ? parseFloat(r.lat) : null,
          lng: r.lng ? parseFloat(r.lng) : null,
          source: r.source?.toLowerCase() || ""
        })).filter(r => r.state && r.district && r.market);

        setMandisData(rows);

        const districtSet = new Set(
          rows
            .filter(r => r.state.toLowerCase() === form.state.toLowerCase())
            .map(r => r.district)
        );

        setDistricts([...districtSet].sort());

      } catch (err) {

        console.log("CSV load failed", err);

      }

      setLoadingMandis(false);
    }

    loadMandis();

  }, []);

  /* ---------------- GEOLOCATION ---------------- */

  useEffect(() => {

    if (!navigator.geolocation)
      return;

    navigator.geolocation.getCurrentPosition(
      pos => {

        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });

      },
      err => console.warn(err),
      { timeout: 10000 }
    );

  }, []);

  /* ---------------- MANDI OPTIONS ---------------- */

  useEffect(() => {

    const options = mandisData
      .filter(r =>
        r.state.toLowerCase() === form.state.toLowerCase() &&
        r.district === form.district
      )
      .map(r => r.market);

    const unique = [...new Set(options)].sort((a, b) =>
      a.localeCompare(b)
    );

    setMandiOptions(unique);

    if (form.mandi &&
      !unique.map(m => m.toLowerCase()).includes(form.mandi.toLowerCase())
    ) {

      setForm(prev => ({ ...prev, mandi: "" }));

    }

  }, [form.district, mandisData, form.state]);

  /* ---------------- PRICE PREDICTION ---------------- */

  const predictPrice = async () => {

    const totalWeight =
      Number(form.kg || 0) + Number(form.grams || 0) / 1000;

    if (!form.crop || !form.district) {
      alert("Select crop and district first");
      return;
    }

    setLoadingPrediction(true);

    try {

      const res = await axios.post(
        "http://localhost:5000/estimator/predict-price",
        {
          commodity: form.crop,
          market: form.mandi,
          state: form.state,
          district: form.district,
          quantity: totalWeight
        }
      );

      setPrediction(res.data);

    } catch (err) {

      console.log(err);
      alert("Prediction failed");

    }

    setLoadingPrediction(false);
  };

  if (loadingMandis)
    return <div className="fresh-item-form">Loading market list...</div>;

  return (

    <div className="fresh-item-form">

      <h2>{item ? "Edit Fresh Crop Item" : "Add Fresh Crop Item"}</h2>

      <select name="crop" value={form.crop} onChange={handleChange}>
        <option value="">Select Crop</option>

        {[...new Set(CROP_FRESH_TYPES)]
          .sort((a, b) => a.localeCompare(b))
          .map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
      </select>

      <div className="weight-row">
        <input name="kg" type="number" placeholder="Kg" value={form.kg} onChange={handleChange}/>
        <input name="grams" type="number" placeholder="Grams" value={form.grams} onChange={handleChange}/>
      </div>

      <input name="state" value={form.state} readOnly />

      <select name="district" value={form.district} onChange={handleChange}>
        <option value="">Select District</option>
        {districts.map(d => <option key={d}>{d}</option>)}
      </select>

      <select
        name="mandi"
        value={form.mandi}
        onChange={handleChange}
        disabled={!form.district}
      >
        <option value="">Select Mandi</option>
        {mandiOptions.map(m => (
          <option key={m}>{m}</option>
        ))}
      </select>

      <button className="predict-btn" onClick={predictPrice} disabled={
    !form.crop ||
    !form.district || !form.mandi ||
    (Number(form.kg) === 0 && Number(form.grams) === 0)
  }>
        🔮 Predict Price
      </button>
{prediction && (

  <div className="prediction-box">

    <h3>Prediction Result</h3>

    <p>
  <b>Predicted price:</b> ₹{(prediction.price_per_quintal / 100)?.toFixed(2)} / kg
</p>

    <p>
  <b>Your crop value:</b> ₹{
    ((prediction.price_per_quintal / 100) *
    (Number(form.kg || 0) + Number(form.grams || 0)/1000)
    ).toFixed(2)
  }
</p>

    <div className="prediction-explanation">
      <h4>Why this price?</h4>
      <p>{prediction.explanation}</p>
    </div>

    {/* USER CHOICE BUTTONS */}

    {!priceLocked && !manualPriceMode && (
      <div className="prediction-actions">

        <button
  className="use-predicted-btn"
  onClick={() => {

    const pricePerKg = prediction.price_per_quintal / 100;

    const kg = Number(form.kg || 0);
    const grams = Number(form.grams || 0);

    const totalWeight = kg + grams / 1000;

    const total = (totalWeight * pricePerKg).toFixed(2);

    setForm(prev => ({
      ...prev,
      price: pricePerKg.toFixed(2),
      totalPrice: total
    }));

    setPriceLocked(true);
    setManualPriceMode(false);

  }}
>
  ✅ Use Predicted Price
</button>

        <button
          className="manual-price-btn"
          onClick={() => setManualPriceMode(true)}
        >
          ✏️ Enter Price Manually
        </button>

      </div>
    )}

  </div>

)}

{manualPriceMode && (

  <input
  name="price"
  type="number"
  value={form.price}
  disabled={priceLocked}
  onChange={handleChange}
/>

)}
{/*         
      <input
        name="price"
        type="number"
        placeholder="Price per kg"
        value={form.price}
        disabled={priceLocked && !manualPriceMode}
        onChange={handleChange}
      /> */}

      <div className="price-box">
        💰 Total Price: ₹{form.totalPrice || 0}
      </div>

      <div className="form-actions">

        <button className = "cancel-btn" onClick={onClose}>Cancel</button>

        {item &&
          <button onClick={handleDelete}>
            Delete
          </button>
        }

        <button

          className="add-item"
          onClick={handleSubmit}
          disabled={!isFormValid || loadingSubmit}
        >
          {loadingSubmit
            ? "Saving..."
            : item ? "Update Item" : "Add Item"}
        </button>

      </div>

    </div>
  );
}

export default FreshForm;