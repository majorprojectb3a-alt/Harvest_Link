import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [products, setProducts] = useState([]);
  const [searchCrop, setSearchCrop] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/fresh/all")
      .then((res) => {
        setProducts(res.data);   // Replace data (no duplicates)
      })
      .catch((err) => console.log(err));
  }, []);

  // Filter logic
  const filteredProducts = products.filter(
    (item) =>
      item.productName
        .toLowerCase()
        .includes(searchCrop.toLowerCase()) &&
      item.location
        .toLowerCase()
        .includes(searchLocation.toLowerCase())
  );

  return (
    <div>
      {/* Navbar */}
      <div
        style={{
          backgroundColor: "green",
          padding: "15px",
          color: "white",
          fontSize: "20px",
        }}
      >
        HarvestLink — Buy Fresh
      </div>

      <div style={{ padding: "20px" }}>
        <h2>Buy Fresh Products</h2>

        {/* Filters */}
        <input
          type="text"
          placeholder="Search by Crop Name"
          onChange={(e) => setSearchCrop(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />

        <input
          type="text"
          placeholder="Search by Location"
          onChange={(e) => setSearchLocation(e.target.value)}
          style={{ padding: "5px" }}
        />

        {/* Product Cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              style={{
                border: "1px solid gray",
                padding: "15px",
                width: "200px",
                borderRadius: "8px",
              }}
            >
              <h3>{item.productName}</h3>
              <p>Price: ₹{item.price}</p>
              <p>Qty: {item.quantity}</p>
              <p>Location: {item.location}</p>

              <button
                onClick={() => navigate("/order", { state: item })}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
               }}
             >
               Buy Now
            </button>
            </div> 
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;