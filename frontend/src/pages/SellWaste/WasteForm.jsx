import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./WasteForm.css";
import { CROP_WASTE_TYPES } from "../../constants/cropWasteTypes";

function WasteForm({ onClose, item }) {

  const [form, setForm] = useState({
    type: "",
    kg: "",
    grams: "",
    pricePerKg: "",
    totalPrice: ""
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  // HANDLE INPUT CHANGE (KG + GRAMS LOGIC)
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };

    const kg = Number(updated.kg) || 0;
    const grams = Number(updated.grams) || 0;
    const totalWeight = kg + grams / 1000;   // CONVERT TO KG

    // AUTO CALCULATE PRICE
    if (totalWeight > 0 && updated.pricePerKg) {
      updated.totalPrice = 
        (totalWeight * Number(updated.pricePerKg)).toFixed(2);
    } else {
      updated.totalPrice = "";
    }

    setForm(updated);
  };

  // SUBMIT FORM
  const handleSubmit = async () => {
    if (!form.type || (!form.kg && !form.grams) || !form.pricePerKg) {
      alert("Please fill all fields");
      return;
    }

    // const details = await axios.post()
    const totalWeight =
      Number(form.kg || 0) + Number(form.grams || 0) / 1000;
    
    setLoadingSubmit(true);
    try {
      const payLoad = {
          type: form.type,
          weight: totalWeight,          // STORE DECIMAL KG
          pricePerKg: form.pricePerKg,
          totalPrice: form.totalPrice
      }

      if(item){
        await axios.put(`http://localhost:5000/waste/update/${item._id}`,payLoad, { withCredentials: true });
        toast.success("Waste Item Updated Successfully");
      }
      else{
        const res = await axios.post("http://localhost:5000/waste/add", payLoad, { withCredentials: true });   
        if (res.data.merged) {
          toast.info("Merged with existing item");
        } else {
          toast.success("Waste Item added successfully");
        }
      }
      onClose();

    } catch (err) {
      if(err.response?.data?.redirect){
        window.location.href = err.response.data.redirect;
      }
      else{
      console.log(err);
      alert("❌ Failed to add waste item");
      }
    }
  };

  const handleDelete = async () =>{
    if(!item)
      return ;

    const confirmDelete = window.confirm('are you sure to want to delete this item?');
    if(!confirmDelete)
      return ;

    try{
      const res = await axios.delete(`http://localhost:5000/waste/delete/${item._id}`,
      { withCredentials: true });

      alert("Item deleted successfully");
      onClose();
    }
    catch(err){
      console.log(err);
      alert("Failed to delete the item");
    }
  }

  const isFormValid =
  form.type &&
  (Number(form.kg) > 0 || Number(form.grams) > 0) &&
  Number(form.pricePerKg) > 0;

  useEffect(() => {
  if (!item) return;

  const kg = Math.floor(item.weight);
  const grams = Math.round((item.weight - kg) * 1000);

  setForm({
    type: item.type || "",
    kg: kg,
    grams: grams,
    pricePerKg: item.pricePerKg || "",
    totalPrice: item.totalPrice || ""
  });
  }, [item]);

  return (
    <div className="waste-form">
      <h2>{item ? "Edit Waste Item" : "♻️ Add Waste Item"}</h2>

      {/* TYPE */}
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
      >
        <option value="">Select Crop Waste Type</option>
        {[...new Set(CROP_WASTE_TYPES)].sort((a,b)=>a.localeCompare(b)).map(type => (
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
          value={form.kg}
          onChange={handleChange}
        />

        <input
          name="grams"
          type="number"
          placeholder="Grams"
          min="0"
          max="999"
          value={form.grams}
          onChange={handleChange}
        />
      </div>

      {/* PRICE PER KG */}
      <input
        name="pricePerKg"
        type="number"
        placeholder="Price per kg (₹)"
        value={form.pricePerKg}
        onChange={handleChange}
      />

      {/* TOTAL PRICE */}
      <div className="price-box" >
        💰 Total Price: ₹{form.totalPrice || 0}
      </div>

      {/* ACTION BUTTONS */}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        {item && <button name="delete-btn" type="button" onClick={handleDelete}>Delete</button>}
        <button type="button" className="add-btn" onClick={handleSubmit} disabled={loadingSubmit || !isFormValid}>
          {loadingSubmit? (item ? "Updating..." : "Adding..."): (item ? "Update Item" : "➕ Add Item")}
        </button>
      </div>
    </div>
  );
}

export default WasteForm;