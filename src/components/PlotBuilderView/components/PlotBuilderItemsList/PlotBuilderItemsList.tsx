import React from "react";
import { Observable } from "rxjs";

import { styled, Button } from "@mui/material";
import { DragHandle } from "@mui/icons-material";
import { Add as AddIcon } from "@mui/icons-material";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";

import { PlotItem } from "@/services/plotter/types";

import DragReorderable from "../../../DragReorderable";

import PlotListItem from "./components/PlotListItem";

export interface PlotBuilderItemsListProps {
  className?: string;
  items$: Observable<readonly PlotBuilderItem[]>;
  highlightItem?: PlotBuilderItem | null;
  enableCheats?: boolean;
  onMoveItem(item: PlotBuilderItem, index: number): void;
  onAddNewItem(itemType: PlotItem["type"]): void;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}

const Root = styled("div")(({ theme }) => ({
  overflow: "auto",
  boxSixing: "border-box",
  display: "flex",
  flexDirection: "column",
  "& .list": {
    listStyle: "none",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  "& .list-item-container": {
    position: "relative",
    marginBottom: theme.spacing(1),
  },
  "& .list-item-drag-handle": {
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(1),
  },
  "& .drop-indicator": {
    width: "100%",
    height: 0,
    borderBottom: "4px solid black",
    marginBottom: theme.spacing(1),
  },
  "& .buttons": {
    alignSelf: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const PlotBuilderItemsList = ({
  className,
  items$,
  highlightItem,
  enableCheats,
  onMoveItem,
  onAddNewItem,
  onMouseOver,
  onMouseOut,
}: PlotBuilderItemsListProps) => {
  const items = useObservation(items$) ?? [];
  return (
    <Root className={className}>
      <ul className="list">
        <DragReorderable
          values={items}
          primaryAxis="top-to-bottom"
          dropIndicator={<div className="drop-indicator" />}
          onReorder={(_, p) => {
            onMoveItem(items[p.fromIndex], p.toIndex);
          }}
        >
          {(value, params, getRootProps, getDragHandleProps) => (
            <div {...getRootProps()} className="list-item-container">
              <PlotListItem
                item={value}
                index={items.indexOf(value)}
                highlight={value === highlightItem}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
              />
              <div className="list-item-drag-handle" {...getDragHandleProps()}>
                <DragHandle />
              </div>
            </div>
          )}
        </DragReorderable>
      </ul>
      <div className="buttons">
        <Button color="primary" onClick={() => onAddNewItem("add-ingredient")}>
          <AddIcon /> Add Ingredient
        </Button>
        <Button color="primary" onClick={() => onAddNewItem("stir-cauldron")}>
          <AddIcon /> Stir Cauldron
        </Button>
        <Button color="primary" onClick={() => onAddNewItem("pour-solvent")}>
          <AddIcon /> Pour Solvent
        </Button>
        <Button color="primary" onClick={() => onAddNewItem("heat-vortex")}>
          <AddIcon /> Heat Vortex
        </Button>
        <Button color="primary" onClick={() => onAddNewItem("void-salt")}>
          <AddIcon /> Add Void Salt
        </Button>
        {enableCheats && (
          <Button
            color="secondary"
            onClick={() => onAddNewItem("set-position")}
          >
            <AddIcon /> Add Teleport
          </Button>
        )}
      </div>
    </Root>
  );
};

export default PlotBuilderItemsList;
