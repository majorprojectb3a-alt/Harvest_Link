import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import OrderPage from "./OrderPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/order" element={<OrderPage />} />
    </Routes>
  </BrowserRouter>
);