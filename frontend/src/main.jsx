import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css"; // File CSS global

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter harus membungkus seluruh App di sini */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
