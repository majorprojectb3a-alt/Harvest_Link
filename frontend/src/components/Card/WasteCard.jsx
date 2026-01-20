import "./wasteCard.css";

export default function WasteCard({ item, onSelect }) {
  return (
    <div
      className="waste-card clickable"
      onClick={() => onSelect(item._id)}   // 🔥 CLICK TO OPEN DETAILS
    >

      {/* LEFT SIDE */}
      <div className="waste-info">
        <h3>{item.type}</h3>
        <p>Quantity: {item.weight} kg</p>
        <p>Seller: {item.userName}</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="waste-meta">
        <div className="price">₹{item.predictedPrice}</div>
        <div className="distance">
          {item.distance !== null
            ? `${item.distance} km away`
            : "Distance unavailable"}
        </div>
      </div>

    </div>
  );
}
