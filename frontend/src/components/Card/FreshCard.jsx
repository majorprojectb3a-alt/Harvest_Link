import "./FreshCard.css";

export default function FreshCard({ item, onSelect }) {

  return (

    <div
      className="fresh-card clickable"
      onClick={() => onSelect(item._id)}
    >

      {/* LEFT SIDE */}
      <div className="fresh-info">

        <h3>{item.type}</h3>

        <p>Quantity: {item.quantity} kg</p>

        <p>Seller: {item.userName}</p>

      </div>


      {/* RIGHT SIDE */}
      <div className="fresh-meta">

        <div className="fresh-price">

          ₹{item.pricePerKg}/kg

        </div>


        <div className="fresh-distance">

          {item.distance !== null
            ? `${item.distance} km away`
            : "Distance unavailable"}

        </div>

      </div>

    </div>

  );

}
