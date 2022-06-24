import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material/styles";
import React from "react";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const darkModeMatch =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setDarkMode] = React.useState(darkModeMatch.matches);
  React.useEffect(() => {
    darkModeMatch.addEventListener("change", (e) => setDarkMode(e.matches));
  }, []);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
