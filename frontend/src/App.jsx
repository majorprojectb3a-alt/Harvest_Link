import React from "react";
import { Routes, Route } from "react-router-dom";
import BuyerHome from './pages/HomePages/BuyerHome';
import FarmerHome from "./pages/HomePages/FarmerHome";
import EditProfile from "./pages/EditProfile/EditProfile";
import BuyFresh from "./pages/BuyFresh/BuyFresh";
import BuyWaste from "./pages/BuyWaste/BuyWaste";
import FarmerAuth from "./pages/Auth/FarmerAuth";
import BuyerAuth from "./pages/Auth/BuyerAuth";
import CropWasteEstimator from "./pages/CropWasteEstimator/CropWasteEstimator";
import Unauthorized from "./pages/Auth/Unauthorized";
import SellWaste from "./pages/Sellwaste/SellWaste";
import SellFresh from "./pages/SellFresh/SellFresh";   
import axios from "axios";
import RoleProtectedRoute from "./pages/Auth/RoleProtectedRoute";
import Profile from "./pages/Profile/Profile";


function App() {
  axios.defaults.withCredentials = true;

  return (
      <Routes>
        <Route path = "/unauthorized" element = {<Unauthorized/>} />
        <Route path="/" element={<FarmerAuth />} />
        <Route path="/BuyerHome" element={
          <RoleProtectedRoute allow = {['buyer']}>
            <BuyerHome />
          </RoleProtectedRoute>
          } />
        <Route path="/FarmerHome" element={
          <RoleProtectedRoute allow = {['farmer']}>
            <FarmerHome />
          </RoleProtectedRoute>
          }/>
        <Route path = "/edit-profile" element = {<EditProfile />} />
        <Route path = "/buy-fresh" element = {
          <RoleProtectedRoute allow = {['buyer']}>
            <BuyFresh />
          </RoleProtectedRoute>
          } />
        <Route path="/buy-waste" element={
          <RoleProtectedRoute allow = {['buyer']}>
            <BuyWaste />
          </RoleProtectedRoute>
        }/>
        <Route path="/farmer" element={<FarmerAuth />} />
        <Route path="/buyer" element={<BuyerAuth />} />
        <Route path="/predict-price" element={<CropWasteEstimator />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sell-waste" element={
          <RoleProtectedRoute allow = {['farmer']}>
            <SellWaste />
          </RoleProtectedRoute>
        }/>
        <Route path="/sell-fresh" element={
          <RoleProtectedRoute allow = {['farmer']}>
            <SellFresh />
          </RoleProtectedRoute>
          } />
      </Routes>
  );
}

export default App;
