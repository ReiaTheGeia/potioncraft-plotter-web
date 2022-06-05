import * as React from "react";

import { ThemeProvider as JssProvider } from "react-jss";

import theme from "../theme";

const ThemeProvider: React.FC = ({ children }) => (
  <JssProvider theme={theme}>
    <>{children}</>
  </JssProvider>
);

export default ThemeProvider;
