import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// ✅ Fix: use GeneralContext instead of missing UserContext
import GeneralContextProvider from "./context/GeneralContext";

import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <GeneralContextProvider>
      <App />
    </GeneralContextProvider>
  </BrowserRouter>
);
