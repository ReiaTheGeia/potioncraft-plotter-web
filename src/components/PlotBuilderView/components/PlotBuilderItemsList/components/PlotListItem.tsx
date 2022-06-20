import React from "react";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";

import PlotListItemCard from "./PlotListItemCard";

import AddIngredientPlotListItem from "./AddIngredientPlotListItem";
import StirCauldronPlotListItem from "./StirCauldronPlotListItem";
import PourSolventPlotListItem from "./PourSolventPlotListItem";
import HeatVortexPlotListItem from "./HeatVortexPlotListItem";
import AddVoidSaltPlotListItem from "./AddVoidSaltPlotListItem";
import SetPositionPlotListItem from "./SetPositionPlotListItem";

export interface PlotListItemProps {
  item: PlotBuilderItem;
  index: number;
  highlight?: boolean;
  onDuplicate(item: PlotBuilderItem): void;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const PlotListItem = ({
  item,
  index,
  highlight = false,
  onDuplicate,
  onMouseOver,
  onMouseOut,
}: PlotListItemProps) => {
  let content: React.ReactNode;
  switch (item.type) {
    case "add-ingredient":
      content = <AddIngredientPlotListItem item={item as any} />;
      break;
    case "stir-cauldron":
      content = <StirCauldronPlotListItem item={item as any} />;
      break;
    case "pour-solvent":
      content = <PourSolventPlotListItem item={item as any} />;
      break;
    case "heat-vortex":
      content = <HeatVortexPlotListItem item={item as any} />;
      break;
    case "void-salt":
      content = <AddVoidSaltPlotListItem item={item as any} />;
      break;
    case "set-position":
      content = <SetPositionPlotListItem item={item as any} />;
      break;
    default:
      content = <div>Unknown plot type {item.type as any}</div>;
  }

  return (
    <PlotListItemCard
      item={item}
      index={index}
      highlight={highlight}
      onDuplicate={onDuplicate}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {content}
    </PlotListItemCard>
  );
};

export default PlotListItem;
