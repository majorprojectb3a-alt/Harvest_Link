import { useEffect, useState } from "react";
import { getWasteItems, getWasteDetails, requestWasteBooking } from "../../api/wasteApi";
import WasteCard from "../Card/WasteCard";
import Filters from "../Filters/Filters";
import "./WasteOptions.css";

export default function WasteOptions() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState("All");
  const [location, setLocation] = useState({ lat: null, lng: null });

  const [selectedWaste, setSelectedWaste] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);

  /* ========================= */
  /* FETCH WASTE ITEMS */
  /* ========================= */

  const fetchWaste = async (lat, lng, type) => {
    try {
      const data = await getWasteItems(lat, lng, type);
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to load waste items");
      setLoading(false);
    }
  };

  /* ========================= */
  /* REFRESH WHEN FILTER CHANGES */
  /* ========================= */

  useEffect(() => {
    if (location.lat && location.lng) {
      setLoading(true);
      fetchWaste(location.lat, location.lng, selectedType);
    }
  }, [selectedType]);

  /* ========================= */
  /* GET USER LOCATION */
  /* ========================= */

  useEffect(() => {

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const buyerLat = position.coords.latitude;
        const buyerLng = position.coords.longitude;

        setLocation({ lat: buyerLat, lng: buyerLng });

        fetchWaste(buyerLat, buyerLng, selectedType);
      },
      () => {
        setError("Please allow location to see nearby waste");
        setLoading(false);
      }
    );

  }, []);

  /* ========================= */
  /* OPEN DETAILS MODAL */
  /* ========================= */

  const openDetails = async (id) => {
    try {
      const data = await getWasteDetails(id);
      setSelectedWaste(data);
      setShowDetails(true);
    } catch {
      alert("Failed to load waste details");
    }
  };

  /* ========================= */
  /* STATES */
  /* ========================= */

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading waste items...</p>;

  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  /* ========================= */
  /* UI */
  /* ========================= */

  return (
    <>

      {/* FILTER BAR */}

      <Filters
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* ITEMS GRID */}

      {items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          No waste items found
        </p>
      ) : (

        <div className="fresh-items-grid">

          {items.map(item => (

            <WasteCard
              key={item._id}
              item={item}
              onSelect={openDetails}
            />

          ))}

        </div>

      )}

      {/* MODAL */}

      {showDetails && selectedWaste && (

        <div
          className="fresh-modal-overlay"
          onClick={() => setShowDetails(false)}
        >

          <div
            className="fresh-modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>{selectedWaste.type}</h2>

            <p>Quantity: {Number(selectedWaste.weight).toFixed(2)} kg</p>
            <p>Total Price: ₹{selectedWaste.predictedPrice}</p>
            <p>Price per kg: ₹{selectedWaste.pricePerKg}</p>

            <hr />

            <h3>Seller Details</h3>

            <p>Name: {selectedWaste.userId.name}</p>
            <p>Email: {selectedWaste.userId.email}</p>
            <p>Phone: {selectedWaste.userId.phone}</p>

            <label>Enter Quantity (kg)</label>

            <input
              type="number"
              min="1"
              max={selectedWaste.weight}
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
            />

            <div className="fresh-btns">

              <button
                className="fresh-buy-btn"
                onClick={async () => {

                  try {

                    await requestWasteBooking({
                      productId: selectedWaste._id,
                      buyerId: localStorage.getItem("userId"),
                      quantity: buyQuantity,
                      itemType: "Waste"
                    });

                    alert("Waste booking request sent!");

                    setShowDetails(false);

                    fetchWaste(
                      location.lat,
                      location.lng,
                      selectedType
                    );

                  } catch {

                    alert("Failed to book waste");

                  }

                }}
              >
                📦 Book Waste
              </button>

              <button
                className="fresh-close-btn"
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