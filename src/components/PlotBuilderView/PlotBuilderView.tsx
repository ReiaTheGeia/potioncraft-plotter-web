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

import { IPlotBuilderViewModel } from "./PlotBuilderViewModel";

export interface PlotBuilderViewProps {
  className?: string;
  viewModel: IPlotBuilderViewModel;
}

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
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
}));

const PlotBuilderView = ({ className, viewModel }: PlotBuilderViewProps) => {
  const map = useObservation(viewModel.map$);
  const plot = useObservation(viewModel.plot$);

  const mouseOverPlotPoint =
    useObservation(viewModel.mouseOverPlotPoint) ?? null;
  const mouseOverPlotItem =
    useObservation(viewModel.mouseOverPlotItem$) ?? null;
  const mouseOverEntity = useObservation(viewModel.mouseOverEntity$) ?? null;
  const mouseWorld = useObservation(viewModel.mouseWorldPosition$) ?? null;

  const scale = useObservation(viewModel.viewScale$) ?? 1;

  return (
    <Root className={className}>
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
    </Root>
  );
};

export default PlotBuilderView;
