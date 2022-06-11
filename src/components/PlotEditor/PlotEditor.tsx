import React from "react";
import { styled, Card, CardContent, Typography } from "@mui/material";

import { useDICreate, useDIDependency } from "@/container";
import { PointZero } from "@/points";

import { useObservation } from "@/hooks/observe";

import { EmptyPlotResult } from "@/services/plotter/types";
import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";

import Plot from "../Plot";
import PlotBuilderItemsList from "../PlotBuilderItemsList";
import PotionMap from "../Map";
import PanZoomViewport from "../PanZoomViewport";

import { PlotEditorViewModel } from "./PlotEditorViewModel";

import StepDetails from "./components/StepDetails";
import PlotDetails from "./components/PlotDetails";
import EntityDetails from "./components/EntityDetails";

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .plot-container": {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  "& .map": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  "& .plot": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  "& .plot-details": {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  "& .inspect-source": {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
  "& .mouse-coords": {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
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
}));

const PlotEditor = () => {
  const viewModel = useDICreate(PlotEditorViewModel);
  const baseRegistry = useDIDependency(PotionBaseRegistry);
  const map = baseRegistry.getPotionBaseById("water" as any)?.map;
  const inspectSource = useObservation(viewModel.mouseOverPlotItem$) ?? null;
  const inspectEntity = useObservation(viewModel.mouseOverEntity$) ?? null;

  const builder = viewModel.builder;

  const plotObserved = useObservation(builder.plot$) ?? null;
  const plot = React.useDeferredValue(plotObserved);

  const highlightItem = useObservation(viewModel.mouseOverBuilderItem$) ?? null;
  const outputShareString = useObservation(viewModel.shareString$) ?? null;

  const mouseWorld = useObservation(viewModel.mouseWorldPosition$) ?? PointZero;

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
      <PanZoomViewport className="plot-container" viewModel={viewModel}>
        {map && <PotionMap className="map" map={map} viewModel={viewModel} />}
        <Plot
          className="plot"
          plot={plot ?? EmptyPlotResult}
          viewModel={viewModel}
        />
        {inspectSource && (
          <StepDetails className="inspect-source" step={inspectSource} />
        )}
        {!inspectSource && inspectEntity && (
          <EntityDetails className="inspect-source" entity={inspectEntity} />
        )}
        {plot && <PlotDetails className="plot-details" plot={plot} />}
        <Card className="mouse-coords">
          <CardContent>
            <Typography variant="overline">
              ({mouseWorld.x.toFixed(2)}, {mouseWorld.y.toFixed(2)})
            </Typography>
          </CardContent>
        </Card>
      </PanZoomViewport>
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
