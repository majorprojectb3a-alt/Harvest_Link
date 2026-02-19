import { useState, useEffect } from "react";
import axios from "axios";
import './SellFresh.css';
import FreshForm from './FreshForm';
import Navbar from "../../components/Navbar/Navbar";

function SellFresh() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () =>{
    axios.get("http://localhost:5000/fresh/my",
        { withCredentials: true })
      .then(res => setItems(res.data.items))
      .catch(err => console.error(err));
  }

  return (
    <>
      <Navbar />

      <div className="sell-fresh-page">
        <h2 className="page-title"> My Fresh Products Listings</h2>

        {items && items.length > 0 ? (
          <div className="seller-list">
            {items.map((item) => (
              <div key={item._id} className="seller-row">

                {/* LEFT SIDE */}
                <div className="seller-info">
                  <h3>{item.crop}</h3>
                  <p>Quantity: {item.quantity} kg</p>
                  <strong>Location:</strong> {item.state}, {item.district}, {item.mandi}
                </div>

                {/* MIDDLE */}
                <div className="seller-price">
                  ₹{item.price}/ unit
                  total: ₹{item.totalPrice}
                </div>

                {/* RIGHT SIDE */}
                <div className="seller-status">
                  <span
                    className={`status-badge ${
                      items.status === "sold" ? "sold" : "available"
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
            <p>No Fresh items added yet.</p>
          </div>
        )}
      </div>
      

        <button className="fab" onClick={() => setShowForm(true)}>
        +
        </button>

        {/* Overlay + Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <FreshForm
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

export default SellFresh;
