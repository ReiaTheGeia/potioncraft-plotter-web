import React from "react";
import {
  Card,
  Typography,
  IconButton,
  CardContent,
  styled,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";

export interface PlotListItemCardProps {
  item: PlotBuilderItem;
  index: number;
  highlight: boolean;
  children: React.ReactNode;
  onMouseOver?(item: PlotBuilderItem): void;
  onMouseOut?(): void;
}

const Root = styled(Card)(({ theme }) => ({
  position: "relative",
  "& .item-index": {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
  },
  "& .delete-button": {
    position: "absolute",
    top: "5px",
    right: "15px",
  },
  "& .item-content": {
    paddingTop: theme.spacing(4),
  },
}));

const PlotListItemCard = ({
  item,
  index,
  highlight,
  children,
  onMouseOver,
  onMouseOut,
}: PlotListItemCardProps) => {
  const valid = useObservation(item.isValid$) ?? false;
  const onCardMouseOver = React.useCallback(() => {
    if (onMouseOver) {
      onMouseOver(item);
    }
  }, [onMouseOver, item]);
  const onDeleteClick = React.useCallback(() => item.delete(), [item]);
  return (
    <Root
      style={{
        backgroundColor:
          (!valid && "salmon") || (highlight && "lightblue") || undefined,
      }}
      onMouseOver={onCardMouseOver}
      onMouseOut={onMouseOut}
    >
      <Typography
        className="item-index"
        variant="overline"
        fontSize={14}
        component="div"
      >
        {index + 1}
      </Typography>
      <IconButton
        size="small"
        className="delete-button"
        onClick={onDeleteClick}
      >
        <DeleteIcon />
      </IconButton>
      <CardContent className="item-content">{children}</CardContent>
    </Root>
  );
};

export default PlotListItemCard;
