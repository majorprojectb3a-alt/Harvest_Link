import { useEffect, useState } from "react";
import { getWasteItems, getWasteDetails, buyWasteItem } from "../../api/wasteApi";
import WasteCard from "../Card/WasteCard";
import Filters from "../Filters/Filters";
import "./WasteOptions.css"

export default function WasteOptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("All");
  const [location, setLocation] = useState({ lat: null, lng: null });

  // 🔥 DETAILS MODAL STATE
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // 🔥 FETCH MARKETPLACE DATA WITH FILTER
  const fetchWaste = async (lat, lng, type) => {
    try {
      const data = await getWasteItems(lat, lng, type);
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.log("🔥 Fetch marketplace error:", err);
      setError("Failed to load waste items");
      setLoading(false);
    }
  };

  // 🔥 REFETCH WHEN FILTER CHANGES
  useEffect(() => {
    if (location.lat && location.lng) {
      setLoading(true);
      fetchWaste(location.lat, location.lng, selectedType);
    }
  }, [selectedType]);

  // 🔥 INITIAL LOCATION FETCH
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const buyerLat = position.coords.latitude;
        const buyerLng = position.coords.longitude;

        console.log("Buyer location:", buyerLat, buyerLng);

        setLocation({ lat: buyerLat, lng: buyerLng });
        fetchWaste(buyerLat, buyerLng, selectedType);
      },
      (err) => {
        console.log("Location error:", err);
        setError("Please allow location to see nearby waste");
        setLoading(false);
      }
    );
  }, []);

  // 🔥 OPEN DETAILS MODAL
  const openDetails = async (id) => {
    try {
      const data = await getWasteDetails(id);
      setSelectedWaste(data);
      setShowDetails(true);
    } catch (err) {
      alert("❌ Failed to load waste details");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading waste items...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <>
      {/* 🔥 FILTER BAR */}
      <Filters
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* 🔥 ITEMS GRID */}
      {items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          No waste items found for selected type
        </p>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <WasteCard
              key={item._id}
              item={item}
              onSelect={openDetails}   // 🔥 CLICK OPENS DETAILS MODAL
            />
          ))}
        </div>
      )}

      {/* 🔥 DETAILS MODAL */}
      {showDetails && selectedWaste && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>{selectedWaste.type}</h2>

            <p><strong>Quantity:</strong> {selectedWaste.weight} kg</p>
            <p><strong>Total Price:</strong> ₹{selectedWaste.predictedPrice}</p>
            <p><strong>Price per kg:</strong> ₹{selectedWaste.pricePerKg}</p>


            <hr />

            {/* 🔥 SELLER DETAILS */}
            <h2>Seller Contact Details</h2>
            <p><strong>Name:</strong> {selectedWaste.userId.name}</p>
            <p><strong>Email:</strong> {selectedWaste.userId.email}</p>
            <p><strong>Phone:</strong> {selectedWaste.userId.phone}</p>

            <hr />
            <br />

            <div className="btns">
              
            {/* 🔥 BOOK BUTTON */}
            <button
              className="book-btn"
              onClick={async () => {
                try {
                  await buyWasteItem(selectedWaste._id);
                  alert("✅ Waste booked successfully");
                  setShowDetails(false);
                  fetchWaste(location.lat, location.lng, selectedType);
                } catch (err) {
                  alert("❌ Failed to book waste");
                }
              }}
            >
              📦 Book Waste
            </button>


            <button
              className="cancel-btn"
              onClick={() => setShowDetails(false)}
            >
              Close
            </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
