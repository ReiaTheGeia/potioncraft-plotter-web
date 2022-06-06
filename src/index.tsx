import "@/style.css";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { ContainerProvider } from "./container";
import ThemeProvider from "./theme";

import App from "./components/App";

const Root: React.FC = () => (
  <React.StrictMode>
    <ContainerProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ContainerProvider>
  </React.StrictMode>
);

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.render(<Root />, rootEl);
}
