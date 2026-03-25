import { useState, useEffect } from "react";
import axios from "axios";
import './SellFresh.css';
import FreshForm from './FreshForm';
import Navbar from "../../components/Navbar/Navbar";

function SellFresh() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  

  const fetchItems = async () =>{
    axios.get("http://localhost:5000/fresh/my",
        { withCredentials: true })
      .then(res => setItems(res.data.items))
      .catch(err => console.error(err));
  }

  useEffect(() => {
    fetchItems();
  }, []);
  
  return (
    <>
      <Navbar />

      <div className="sell-fresh-page">
        <h2 className="page-title"> Fresh Products</h2>

        {items && items.length > 0 ? (
          <div className="seller-list">
            {items.map((item) => (
              <div key={item._id} className="seller-row" onClick={() =>{
                setEditingItem(item);
                setShowForm(true);
              }}>

                {/* LEFT SIDE */}
                <div className="seller-info">
                  <h3>{item.crop}</h3>
                  {item.status === "available" && 
                  <p>Quantity: {item.weight} kg</p>}
                  <strong>Location:</strong> {item.mandi}, {item.district}, {item.state}
                </div>

                {/* MIDDLE */}
                <div className="seller-price">
                  ₹{item.price}/ unit <br/>
                  Total: ₹{item.totalPrice}
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
            <p>No Fresh items added yet.</p>
          </div>
        )}
      </div>
      

        <button className="fab" onClick={() => setShowForm(true)}>
        +
        </button>

        {/* Overlay + Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => {setShowForm(false); setEditingItem(null)}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <FreshForm item = {editingItem}
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

export default SellFresh;
