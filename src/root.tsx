import * as React from "react";

import ThemeProvider from "@/theme/components/ThemeProvider";

import { ContainerProvider } from "./container";

import App from "@/components/App";

const Root: React.FC = () => (
  <React.StrictMode>
    <ContainerProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ContainerProvider>
  </React.StrictMode>
);

export default Root;
