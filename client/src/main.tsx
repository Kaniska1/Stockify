// @ts-expect-error - react-dom/client types are not available in this project
import { createRoot } from "react-dom/client";
import React from "react";

import App from "./app/App";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(React.createElement(App));