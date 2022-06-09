import React from "react";
import { throttleTime } from "rxjs";
import { styled } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { ingredientId } from "@/services/ingredients/types";

import Plot from "../Plot";
import PlotBuilderItemsList from "../PlotBuilderItemsList";

import { PlotEditorViewModel } from "./PlotEditorViewModel";
import { EmptyPlotResult } from "@/services/plotter/types";
import { useQueryString } from "@/hooks/query-string";

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
  "& .plot-items": {
    width: "400px",
    height: "100%",
  },
});

const PlotEditor = () => {
  const viewModel = useDICreate(PlotEditorViewModel);
  const builder = viewModel.builder;

  const plotObserved = useObservation(builder.plot$) ?? null;
  const plot = React.useDeferredValue(plotObserved);
  const highlightItem = useObservation(viewModel.mouseOverBuilderItem$) ?? null;
  const outputShareString = useObservation(viewModel.shareString$) ?? null;

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.has("data")) {
      const data = query.get("data")!;
      builder.loadFromShareString(data);
    }
  }, []);

  React.useEffect(() => {
    if (!outputShareString) {
      return;
    }
    const query = new URLSearchParams(window.location.search);
    query.set("data", outputShareString);
    window.history.replaceState({}, "", `?${query.toString()}`);
  }, [outputShareString]);

  return (
    <Root>
      <Plot
        className="plot"
        plot={plot ?? EmptyPlotResult}
        viewModel={viewModel}
      />
      <div className="divider" />
      <PlotBuilderItemsList
        className="plot-items"
        builder={builder}
        highlightItem={highlightItem}
        onMouseOver={(item) => viewModel.onMouseOverBuilderItem(item)}
        onMouseOut={() => viewModel.onMouseOverBuilderItem(null)}
      />
    </Root>
  );
};

export default PlotEditor;
