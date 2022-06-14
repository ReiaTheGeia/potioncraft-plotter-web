import React from "react";
import { styled, Card, CardContent, Typography } from "@mui/material";

import { useDICreate, useDIDependency } from "@/container";

import { useObservation } from "@/hooks/observe";

import { EmptyPlotResult } from "@/services/plotter/types";
import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";
import { PlotBuilderItem } from "@/services/plotter/builder";
import { History } from "@/services/history/History";

import Plot from "@/components/Plot";
import PlotBuilderItemsList from "@/components/PlotBuilderItemsList";
import PotionMap from "@/components/Map";
import PanZoomViewport from "@/components/PanZoomViewport";
import IncDecSlider from "@/components/IncDecSlider";
import PointDetails from "@/components/PointDetails";
import StepDetails from "@/components/StepDetails";
import PlotDetails from "@/components/PlotDetails";
import EntityDetails from "@/components/EntityDetails";

import { PlotterPageViewModel } from "./PlotterPageViewModel";

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .outer-container": {
    position: "relative",
    width: "100%",
    height: "100%",
  },
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
  "& .inspect-stack": {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  "& .inspect-stack > *": {
    marginBottom: theme.spacing(2),
  },
  "& .mouse-coords": {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  "& .zoom": {
    position: "absolute",
    width: "200px",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
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

const PlotterPage = () => {
  const history = useDIDependency(History);
  const viewModel = useDICreate(PlotterPageViewModel);
  const baseRegistry = useDIDependency(PotionBaseRegistry);
  const map = baseRegistry.getPotionBaseById("water" as any)?.map;
  const mouseOverPlotPoint =
    useObservation(viewModel.mouseOverPlotPoint) ?? null;
  const mouseOverPlotItem =
    useObservation(viewModel.mouseOverPlotItem$) ?? null;
  const mouseOverEntity = useObservation(viewModel.mouseOverEntity$) ?? null;
  const scale = useObservation(viewModel.viewScale$) ?? 1;

  const builder = viewModel.builder;

  const plot = useObservation(builder.plot$, { useTransition: false }) ?? null;

  const highlightItem = useObservation(viewModel.mouseOverBuilderItem$) ?? null;
  const outputShareString =
    useObservation(viewModel.shareString$, { useTransition: true }) ?? null;

  const mouseWorld = useObservation(viewModel.mouseWorldPosition$) ?? null;

  React.useEffect(() => {
    const query = new URLSearchParams(history.location.search);
    if (query.has("data")) {
      const data = query.get("data")!;
      builder.loadFromShareString(data);
    }
  }, [history]);

  React.useEffect(() => {
    if (!outputShareString) {
      return;
    }
    const query = new URLSearchParams(history.location.search);
    query.set("data", outputShareString);
    history.replace({
      search: query.toString(),
    });
  }, [history, outputShareString]);

  const onBuildItemMouseOver = React.useCallback(
    (item: PlotBuilderItem) => {
      viewModel.onMouseOverBuilderItem(item);
    },
    [viewModel]
  );

  const onBuildItemMouseOut = React.useCallback(() => {
    viewModel.onMouseOverBuilderItem(null);
  }, [viewModel]);

  return (
    <Root>
      <div className="outer-container">
        <PanZoomViewport className="plot-container" viewModel={viewModel}>
          {map && <PotionMap className="map" map={map} viewModel={viewModel} />}
          <Plot
            className="plot"
            plot={plot ?? EmptyPlotResult}
            viewModel={viewModel}
          />
        </PanZoomViewport>
        <div className="inspect-stack">
          {mouseOverPlotPoint && <PointDetails point={mouseOverPlotPoint} />}
          {mouseOverPlotItem && <StepDetails step={mouseOverPlotItem} />}
          {!mouseOverPlotItem && mouseOverEntity && (
            <EntityDetails entity={mouseOverEntity} />
          )}
        </div>
        {plot && <PlotDetails className="plot-details" plot={plot} />}
        {mouseWorld && (
          <Card className="mouse-coords">
            <CardContent>
              <Typography variant="overline">
                ({mouseWorld.x.toFixed(2)}, {mouseWorld.y.toFixed(2)})
              </Typography>
            </CardContent>
          </Card>
        )}
        <IncDecSlider
          className="zoom"
          value={scale}
          rate={14}
          onChange={(value) => viewModel.setZoom(value)}
        />
      </div>
      <div className="divider" />
      <PlotBuilderItemsList
        className="plot-items"
        builder={builder}
        highlightItem={highlightItem}
        onMouseOver={onBuildItemMouseOver}
        onMouseOut={onBuildItemMouseOut}
      />
    </Root>
  );
};

export default PlotterPage;
