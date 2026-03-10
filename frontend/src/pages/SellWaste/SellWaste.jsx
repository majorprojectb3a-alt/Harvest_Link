// src/pages/SellWaste/SellWaste.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import WasteForm from "./WasteForm";
import axios from "axios";
import "./SellWaste.css";

function SellWaste() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
        <h2 className="page-title">Crop Waste</h2>

        {items.length > 0 ? (
          <div className="seller-list">

            {items.map((item) => {

              // Safe price calculation
              const totalPrice =
                item.totalPrice ??
                (item.pricePerKg * item.weight);

              return (

                <div
                  key={item._id}
                  className="seller-row"
                  onClick={() => {
                    setEditingItem(item);
                    setShowForm(true);
                  }}
                >

                  {/* LEFT SIDE */}
                  <div className="seller-info">
                    <h3>{item.type}</h3>
                    <p>
                      Quantity: {Number(item.weight).toFixed(2)} kg
                    </p>
                  </div>

                  {/* MIDDLE PRICE */}
                  <div className="seller-price">
                    ₹{Number(totalPrice).toFixed(2)}
                  </div>

                  {/* RIGHT STATUS */}
                  <div className="seller-status">
                    <span
                      className={`status-badge ${
                        item.status === "sold"
                          ? "sold"
                          : "available"
                      }`}
                    >
                      {item.status
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : "Available"}
                    </span>
                  </div>

                </div>

              );
            })}

          </div>
        ) : (

          <div className="empty-state">
            <p>No waste items added yet.</p>
          </div>

        )}
      </div>

      {/* Floating Add Button */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
      >
        +
      </button>

      {/* Overlay + Form */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <WasteForm
              item={editingItem}
              onClose={() => {
                setShowForm(false);
                setEditingItem(null);
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