import React from "react";
import { styled, Card, CardContent, Typography } from "@mui/material";

import { useObservation } from "@/hooks/observe";
import { EmptyPlotResult } from "@/services/plotter/types";

import IncDecSlider from "../IncDecSlider";
import PointDetails from "../PointDetails";
import StepDetails from "../StepDetails";
import PlotDetails from "../PlotDetails";
import EntityDetails from "../EntityDetails";
import PotionMap from "../Map";
import PanZoomViewport from "../PanZoomViewport";
import Plot from "../Plot";

import FixedValue from "../FixedValue";

import PlotBuilderItemsList from "./components/PlotBuilderItemsList";

import { IPlotBuilderViewModel } from "./PlotBuilderViewModel";
import { PlotBuilderItem } from "./builder";

export interface PlotBuilderViewProps {
  className?: string;
  enableCheats?: boolean;
  viewModel: IPlotBuilderViewModel;
  mapOverlay?: React.ReactNode;
}

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .map-view": {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  "& .pan-zoom-container": {
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
  "& .plot-details": {
    position: "absolute",
    top: theme.spacing(2),
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

const PlotBuilderView = ({
  className,
  viewModel,
  mapOverlay,
  enableCheats,
}: PlotBuilderViewProps) => {
  const map = useObservation(viewModel.map$);
  const plot = useObservation(viewModel.plot$);

  const mouseOverPlotPoint =
    useObservation(viewModel.highlightPlotPoint$) ?? null;
  const mouseOverPlotItem =
    useObservation(viewModel.highlightPlotItem$) ?? null;
  const mouseOverEntity = useObservation(viewModel.highlightEntity$) ?? null;
  const mouseWorld = useObservation(viewModel.mouseWorldPosition$) ?? null;

  const scale = useObservation(viewModel.viewScale$) ?? 1;

  const highlightItem = useObservation(viewModel.highlightBuilderItem$) ?? null;

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
    <Root className={className}>
      <div className="map-view">
        <PanZoomViewport className="pan-zoom-container" viewModel={viewModel}>
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
                <FixedValue value={mouseWorld.x} />,{" "}
                <FixedValue value={mouseWorld.y} />
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
        {mapOverlay}
      </div>
      <div className="divider" />
      <PlotBuilderItemsList
        className="plot-items"
        items$={viewModel.plotBuilderItems$}
        highlightItem={highlightItem}
        enableCheats={enableCheats}
        onMoveItem={(item, index) => viewModel.movePlotBuilderItem(item, index)}
        onAddNewItem={(itemType) => viewModel.addPlotBuilderItem(itemType)}
        onMouseOver={onBuildItemMouseOver}
        onMouseOut={onBuildItemMouseOut}
      />
    </Root>
  );
};

export default PlotBuilderView;
