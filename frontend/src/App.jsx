import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Dashboard from './pages/Dashboard/Dashboard';
import EditProfile from "./pages/EditProfile/EditProfile";
import BuyFresh from "./pages/BuyFresh/BuyFresh";
import BuyWaste from "./pages/BuyWaste/BuyWaste";
import FarmerAuth from "./FarmerAuth";
import CustomerAuth from "./CustomerAuth";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path = "/" element = {<Dashboard />} /> */}
        <Route path = "/edit-profile" element = {<EditProfile />} />
        <Route path = "/buy-fresh" element = {<BuyFresh />} />
        <Route path = "/buy-waste" element = {<BuyWaste />} />
        <Route path="/" element={<FarmerAuth />} />
        <Route path="/farmer" element={<FarmerAuth />} />
        <Route path="/customer" element={<CustomerAuth />} />
      </Routes>
    </Router>
  );
};

export default App;
