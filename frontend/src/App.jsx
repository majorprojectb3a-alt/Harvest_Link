import { Routes, Route } from "react-router-dom";
import FarmerAuth from "./FarmerAuth";
import CustomerAuth from "./CustomerAuth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FarmerAuth />} />
      <Route path="/farmer" element={<FarmerAuth />} />
      <Route path="/customer" element={<CustomerAuth />} />
    </Routes>
  );
}

export default App;
