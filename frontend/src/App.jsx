import React from "react";
import { Routes, Route } from "react-router-dom";
import BuyerHome from './pages/HomePages/BuyerHome';
import FarmerHome from "./pages/HomePages/FarmerHome";
import EditProfile from "./pages/EditProfile/EditProfile";
import BuyFresh from "./pages/BuyFresh/BuyFresh";
import BuyWaste from "./pages/BuyWaste/BuyWaste";
import FarmerAuth from "./pages/Auth/FarmerAuth";
import CustomerAuth from "./pages/Auth/CustomerAuth";
import CropWasteEstimator from "./pages/CropWasteEstimator/CropWasteEstimator";
import SellWaste from "./pages/Sellwaste/SellWaste";
import SellFresh from "./pages/SellFresh/SellFresh.jsx";   // ✅ Corrected here
import axios from "axios";

function App() {
  axios.defaults.withCredentials = true;

  return (
    <Routes>
      <Route path="/" element={<FarmerAuth />} />
      <Route path="/BuyerHome" element={<BuyerHome />} />
      <Route path="/FarmerHome" element={<FarmerHome />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/buy-fresh" element={<BuyFresh />} />
      <Route path="/buy-waste" element={<BuyWaste />} />
      <Route path="/farmer" element={<FarmerAuth />} />
      <Route path="/customer" element={<CustomerAuth />} />
      <Route path="/predict-price" element={<CropWasteEstimator />} />
      <Route path="/sell-waste" element={<SellWaste />} />
      <Route path="/sellfresh" element={<SellFresh />} />  {/* ✅ Matches import */}
    </Routes>
  );
}

export default App;
