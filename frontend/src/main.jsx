import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Global styles first
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

// 🔥 Import Auth.css last so it overrides everything else
import "./pages/Auth/Auth.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
