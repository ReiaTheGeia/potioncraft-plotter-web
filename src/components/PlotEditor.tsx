import React from "react";
import { styled } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { ingredients } from "@/services/ingredients/ingredients";
import { PlotBuilder } from "@/services/plotter/PlotBuilder";

import Plot from "./Plot";
import PlotItemsList from "./PlotItemsList";
import { ingredientId } from "@/services/ingredients/types";

const Root = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .plot": {
    width: "100%",
    height: "100%",
  },
  "& .divider": {
    width: "2px",
    height: "100%",
    background: "grey",
  },
  "& .plotItems": {
    width: "400px",
    height: "100%",
  },
});

const PlotEditor = () => {
  const builder = useDICreate(PlotBuilder);
  React.useEffect(() => {
    const item = builder.addIngredient();
    item.setIngredient(ingredientId("Windbloom"));
    item.setGrindPercent(0.5);
  }, [builder]);
  const plot = useObservation(builder.plot$);

  return (
    <Root>
      {!plot && <div className="plot">No Plot</div>}
      {plot && <Plot className="plot" plot={plot} />}
      <div className="divider" />
      <PlotItemsList className="plotItems" builder={builder} />
    </Root>
  );
};

export default PlotEditor;
