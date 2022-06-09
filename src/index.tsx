import "@/style.css";

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { ContainerProvider } from "./container";
import ThemeProvider from "./theme";

import App from "./components/App";

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl!);
root.render(
  <React.StrictMode>
    <ContainerProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ContainerProvider>
  </React.StrictMode>
);
