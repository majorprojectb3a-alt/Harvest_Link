import { useLocation } from "react-router-dom";

const OrderPage = () => {

  const { state: product } = useLocation();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Order Details</h1>

      <p><b>Crop:</b> {product.productName}</p>
      <p><b>Price:</b> ₹{product.price}</p>
      <p><b>Quantity:</b> {product.quantity} kg</p>
      <p><b>Location:</b> {product.location}</p>

      <h3>Seller Contact</h3>

      <p><b>Phone:</b> {product.sellerPhone}</p>
      <p><b>Email:</b> {product.sellerEmail}</p>

      <button
        style={{
          background: "green",
          color: "white",
          padding: "10px",
          border: "none"
        }}
      >
        Confirm Order
      </button>
    </div>
  );
};

export default OrderPage;