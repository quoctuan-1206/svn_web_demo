import React from "react";
import ReactDOM from "react-dom/client";
import "../i18n";
import { setupApiClient } from "../utils/apiOriginUrl";
import App from "./App";
import "./index.css";

setupApiClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
