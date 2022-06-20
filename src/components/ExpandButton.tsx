import React from "react";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

const ExpandMore = styled((props: IconButtonProps & { expand: boolean }) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export interface ExpandButtonProps {
  expanded: boolean;
  onExpanded(expanded: boolean): void;
}

const ExpandButton = ({ expanded, onExpanded }: ExpandButtonProps) => {
  return (
    <ExpandMore expand={expanded} onClick={() => onExpanded(!expanded)}>
      <ExpandMoreIcon />
    </ExpandMore>
  );
};

export default ExpandButton;
