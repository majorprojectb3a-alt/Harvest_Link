import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./FreshForm.css";
import { CROP_FRESH_TYPES } from "../../constants/cropFreshTypes";
// import {DISTRICTS} from "../../constants/Districts";
// import {MARKETS} from "../../constants/Markets";

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
  const [mandisData, setMandisData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandiOptions, setMandiOptions] = useState([]);
  const [loadingMandis, setLoadingMandis] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() =>{
    async function loadMandis() {
      try{
        const res = await axios.get("/mandis_geocoded.csv");
        const csvText = res.data;
        const parsed = Papa.parse(csvText, {header: true, skipEmptyLines: true});
        const rows = parsed.data.map(r =>({
          state: (r.state),
          district: (r.district),
          market: (r.market),
          lat: r.lat? Number(r.lat): null,
          lng: r.lng? Number(r.lng): null,
          source: (r.source).toLowerCase()
        })).filter(r => r.state && r.district && r.market);

        setMandisData(rows);

        const stateName = form.state;
        const districtSet = new Set(rows.filter(r => r.state.toLowerCase() === stateName.toLowerCase())).map(r => r.district)

        setDistricts(Array.from(districtSet).sort((a, b)=> a.localeCompare(b)));
        setLoadingMandis(false);
      }
      catch(err ){
        console.log("falied to load mandis csv", err)

        try {
          const res2 = await axios.get("http://localhost:5000/api/mandis");
          setMandisData(res2.data);
          const stateName = form.state;
          const districtSet = new Set(
            res2.data.filter(r => r.state.toLowerCase() === stateName.toLowerCase()).map(r => r.district)
          );
          setDistricts(Array.from(districtSet).sort((a,b) => a.localeCompare(b)));
        } catch (err2) {
          console.error("Also failed to fetch /api/mandis", err2);
          setMandisData([]);
        } finally {
          setLoadingMandis(false);
        }
      }
    }

    loadMandis();
  }, []);

  useEffect(() =>{
    if(!navigator.geolocation){
      console.warn("Geolocation not supported");
      return ;
    }
    navigator.geolocation.getCurrentPosition((pos) =>{
      setLocation({lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    },
    (err) =>{
      console.warn("Geolocation denied or failed: ", err)
    }, 
    {timeout: 10000}
  );
  }, []);

  useEffect(()=>{
    if(!form.district){
      setMandiOptions([]);
      setForm(prev => ({...prev, mandi: ""}));
      return ;
    }

    const stateName = form.state;
    const options = mandisData.filter(r => r.state.toLowerCase() === stateName.toLowerCase() && r.district === form.district).map(r => r.market);

    const unique = Array.from(new Set(options)).sort((a, b) => a.localeCompare(b));
    setMandiOptions(unique);

    if(form.mandi && !unique.includes(form.mandi)){
      setForm(prev => ({...prev, mandi: ""}));
    }
  }, [form.district, mandisData, form.state]);

  // HANDLE INPUT CHANGE (KG + GRAMS LOGIC)
  const handleChange = (e) => {
    const {name, value} = e.target;
    const updated = { ...form, [name]: value };

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

  const getMandiCoords = (market, district, state) =>{
    if(!market)
      return {lat: null, lng: null, source: null}

    const candidates = mandisData.filter(r =>
      r.state.toLowerCase() === state.toLowerCase() && r.district === district && r.market === market
    );

    if(!candidates || candidates.length === 0)
      return {lat: null, lng: null, source: null};

    const any = candidates.find(x => x.lat != null && x.lng != null);
    if (any) return { lat: any.lat, lng: any.lng, source: any.source || null };

    return { lat: null, lng: null, source: null };
  }

  // SUBMIT FORM
  const handleSubmit = async () => {
    if (!form.crop || (!form.kg && !form.grams) || !form.price) {
      alert("Please fill all fields");
      return;
    }
    
    let chosenLat = null, chosenLng = null, chosenSource = null;

    if(form.mandi){
      const coords = getMandiCoords(form.mandi, form.district, form.state);
      if(coords.lat != null && coords.lng != null){
        chosenLat = coords.lat;
        chosenLng = coords.lng;
        chosenSource = coords.source;
      }
    }


    if (!chosenLat || !chosenLng){
      alert("Cannot determine mandi coordinates. Please select a mandi with coordinates or enable location permissions");
      return;
    }

    const totalWeight =
      Number(form.kg || 0) + Number(form.grams || 0) / 1000;

      setLoadingSubmit(true);

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
            lat: chosenLat,
            lng: chosenLng,
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

  if(loadingMandis){
    return <div className="fresh-item-form"> Loading market list...</div>
  }
  return (
    <div className="fresh-item-form">
      <h2> Add Fresh Crop Item</h2>

      {/* CROP TYPE */}
      <select name="crop" value={form.crop} onChange={handleChange}>
      <option value="">Select Crop Fresh Type</option>

      {[...new Set(CROP_FRESH_TYPES)]
        .sort((a,b)=>a.localeCompare(b))
        .map(type => (
          <option key={type} value={type}>
            {type}
          </option>
      ))}

      </select>

      {/* WEIGHT INPUT: KG + GRAMS */}
      <div className="weight-row">
        <input name="kg" type="number" placeholder="Kg" min="0" onChange={handleChange}/>
        <input name="grams" type="number" placeholder="Grams" min="0" max="999" onChange={handleChange}/>
      </div>

      {/* PRICE PER KG */}
      <input name="price" type="number" placeholder="Price per kg (₹)" onChange={handleChange}/>
      
      {/* STATE (READ ONLY) */}
      <input name="state" type="text" placeholder="State" value="Andhra Pradesh" readOnly onChange={handleChange}/>


      {/* DISTRICT: built from CSV for the chosen state */}
      <select name="district" value={form.district} onChange={handleChange}>
        <option value="">Select District</option>
        {districts.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* MANDI: filtered by district */}
      <select name="mandi" value={form.mandi} onChange={handleChange} disabled={!form.district || mandiOptions.length === 0}>
        <option value="">Select Mandi name</option>
        {mandiOptions.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      
      {/* show selected mandi coords (if available) or fallback note */}
      <div style={{ marginTop: 8 }}>
        {form.mandi ? (
          (() => {
            const { lat, lng, source } = getMandiCoords(form.mandi, form.district, form.state);
            if (lat && lng) {
              return <div>Selected mandi coords: {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)} (source: {source})</div>;
            } else if (location.lat && location.lng) {
              return <div>Selected mandi does not have coords — using your browser location as fallback.</div>;
            } else {
              return <div>Selected mandi has no coordinates and browser location unavailable — cannot post until coords available.</div>;
            }
          })()
        ) : (
          <div style={{ color: "#666" }}>Choose district → mandi to auto-fill mandi coordinates (or allow browser location)</div>
        )}
      </div>
      
      {/* TOTAL PRICE */}
      <div className="price-box">
        💰 Total Price: ₹{form.totalPrice || 0}
      </div>

      {/* ACTION BUTTONS */}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="add-btn" onClick={handleSubmit} disabled = {loadingSubmit}>{loadingSubmit ? "Adding..." : "➕ Add Item"}</button>
      </div>
    </div>
  );
}

export default FreshForm;
