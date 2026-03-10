// src/api/wasteApi.js
import axios from "axios";

// GET MARKETPLACE WASTE
export const getWasteItems = async (buyerLat, buyerLng, type) => {
  let url = `http://localhost:5000/waste?buyerLat=${buyerLat}&buyerLng=${buyerLng}`;

  if (type && type !== "All") {
    url += `&type=${encodeURIComponent(type)}`;
  }

  const res = await axios.get(url, { withCredentials: true });

  return res.data;
};

// GET WASTE DETAILS WITH SELLER CONTACT
export const getWasteDetails = async (id) => {
  const res = await axios.get(
    `http://localhost:5000/waste/details/${id}`,
    { withCredentials: true }
  );

  return res.data;
};



export const requestWasteBooking = async (data) => {

  const res = await axios.post(
    "http://localhost:5000/api/bookings/book",
    data,
    { withCredentials: true }
  );

  return res.data;
};
