// src/pages/SellWaste/SellWaste.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import WasteForm from "./WasteForm";
import axios from "axios";
import "./SellWaste.css";

function SellWaste() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // FETCH SELLER'S OWN WASTE
  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/waste/my",
        { withCredentials: true }
      );

      setItems(res.data.items || []);
    } catch (err) {
      console.log("🔥 Fetch seller waste error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <>
      <Navbar />

      <div className="sell-waste-page">
        <h2 className="page-title"> My Waste Listings</h2>

        {items.length > 0 ? (
          <div className="seller-list">
            {items.map((item) => (
              <div key={item._id} className="seller-row">

                {/* LEFT SIDE */}
                <div className="seller-info">
                  <h3>{item.type}</h3>
                  <p>Quantity: {item.weight} kg</p>
                </div>

                {/* MIDDLE */}
                <div className="seller-price">
                  ₹{item.predictedPrice}
                </div>

                {/* RIGHT SIDE */}
                <div className="seller-status">
                  <span
                    className={`status-badge ${
                      item.status === "sold" ? "sold" : "available"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No waste items added yet.</p>
          </div>
        )}
      </div>

      {/* Floating + button */}
      <button className="fab" onClick={() => setShowForm(true)}>
        +
      </button>

      {/* Overlay + Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <WasteForm
              onClose={() => {
                setShowForm(false);
                fetchItems();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default SellWaste;
