import React from "react";

import {
  AddIngredientPlotBuilderItem,
  HeatVortexPlotBuilderItem,
  PlotBuilderItem,
  PourSolventPlotBuilderItem,
  SetPositionPlotBuilderItem,
  StirCauldronPlotBuilderItem,
  VoidSaltPlotBuilderItem,
} from "@/components/PlotBuilderView/builder";

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
  if (item instanceof AddIngredientPlotBuilderItem) {
    content = <AddIngredientPlotListItem item={item} />;
  } else if (item instanceof StirCauldronPlotBuilderItem) {
    content = <StirCauldronPlotListItem item={item} />;
  } else if (item instanceof PourSolventPlotBuilderItem) {
    content = <PourSolventPlotListItem item={item} />;
  } else if (item instanceof HeatVortexPlotBuilderItem) {
    content = <HeatVortexPlotListItem item={item} />;
  } else if (item instanceof VoidSaltPlotBuilderItem) {
    content = <AddVoidSaltPlotListItem item={item} />;
  } else if (item instanceof SetPositionPlotBuilderItem) {
    content = <SetPositionPlotListItem item={item} />;
  } else {
    content = <div>Unknown PlotItemBuilder {item.constructor.name}</div>;
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
