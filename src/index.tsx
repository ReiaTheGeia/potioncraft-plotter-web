import "@/style.css";

import "./console";

import React from "react";
import ReactDOM from "react-dom/client";

import CssBaseline from "@mui/material/CssBaseline";

import { ContainerProvider } from "./container";
import ThemeProvider from "./theme";

import AppRouter from "@/services/history/AppRouter";
import AppRoutes from "./routes";

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl!);
root.render(
  <React.StrictMode>
    <ContainerProvider>
      <AppRouter>
        <ThemeProvider>
          <CssBaseline />
          <AppRoutes />
        </ThemeProvider>
      </AppRouter>
    </ContainerProvider>
  </React.StrictMode>
);
