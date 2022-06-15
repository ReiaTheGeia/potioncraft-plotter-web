import React from "react";
import { styled } from "@mui/material";

export interface OverlayProps {
  position: "top-left" | "top" | "top-right";
  children: React.ReactNode;
}

const Root = styled("div")(({ theme }) => ({
  position: "absolute",
  "&.top-left": {
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
  "&.top": {
    top: theme.spacing(2),
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  "&.top-right": {
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const Overlay = ({ position, children }: OverlayProps) => {
  return <Root className={position}>{children}</Root>;
};

export default Overlay;
