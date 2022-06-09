import React from "react";
import Color from "color";
import { styled } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";
import { PointZero } from "@/points";
import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import { PointArray } from "@/point-array";
import { keepEveryK } from "@/utils";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import {
  IPlotViewModel,
  PlotViewModel,
  PlotViewModelContext,
  usePlotViewModel,
} from "./PlotViewModel";

import PanZoomHandler from "./components/PanZoomHandler";
import PlotDetails from "./components/PlotDetails";
import StepDetails from "./components/StepDetails";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
  viewModel?: IPlotViewModel;
}

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#DABE99",
  overflow: "auto",
  position: "relative",
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
  "& .plot-svg": {
    display: "block",
  },
}));

const Plot = ({ className, plot, viewModel: externalViewModel }: PlotProps) => {
  const internalViewModel = useDICreate(PlotViewModel);
  const viewModel = externalViewModel ?? internalViewModel;

  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;
  const inspectSource = useObservation(viewModel.mouseOverItem$) ?? null;

  const onLineMouseOver = React.useCallback(
    (line: PlotLine) => {
      viewModel.onMouseOverPlotItem(line.source);
    },
    [viewModel]
  );

  const [committedLines, pendingLines] = resultToPlotLines(
    plot.committedPoints,
    plot.pendingPoints
  );

  let left = -MAP_EXTENT_RADIUS + offset.x;
  let top = -MAP_EXTENT_RADIUS + offset.y;
  let width = MAP_EXTENT_RADIUS * 2 * (1 / scale);
  let height = MAP_EXTENT_RADIUS * 2 * (1 / scale);

  return (
    <Root className={className}>
      <PlotViewModelContext.Provider value={viewModel}>
        <PanZoomHandler>
          <svg
            className="plot-svg"
            width="100%"
            height="100%"
            viewBox={`${left} ${top} ${width} ${height}`}
            transform="scale(1, -1)"
          >
            <rect
              x={-60}
              y={-60}
              width={120}
              height={120}
              stroke="red"
              fill="none"
              strokeWidth={0.2 / scale}
            />
            <circle cx={0} cy={0} r={POTION_RADIUS} fill="blue" />
            {committedLines.map((line, i) => (
              <PlotLine
                key={i}
                line={line}
                pending={false}
                highlight={line.source === inspectSource}
                onMouseOver={onLineMouseOver}
                onMouseOut={() => viewModel.onMouseOverPlotItem(null)}
              />
            ))}
            {pendingLines.map((line, i) => (
              <PlotLine
                key={i}
                line={line}
                pending={true}
                highlight={line.source === inspectSource}
                onMouseOver={onLineMouseOver}
                onMouseOut={() => viewModel.onMouseOverPlotItem(null)}
              />
            ))}
          </svg>
          {inspectSource && (
            <StepDetails className="inspect-source" step={inspectSource} />
          )}
          <PlotDetails className="plot-details" plot={plot} />
        </PanZoomHandler>
      </PlotViewModelContext.Provider>
    </Root>
  );
};

interface PlotLineProps {
  line: PlotLine;
  pending: boolean;
  highlight: boolean;
  onMouseOver(line: PlotLine): void;
  onMouseOut(): void;
}
const PlotLine = ({
  line,
  pending,
  highlight,
  onMouseOver,
  onMouseOut,
}: PlotLineProps) => {
  const viewModel = usePlotViewModel();
  const scale = useObservation(viewModel.viewScale$) ?? 1;
  const { points, source, evenOdd } = line;

  const onPathMouseOver = React.useCallback(() => {
    onMouseOver(line);
  }, [line, onMouseOver]);

  if (points.length === 0) {
    return null;
  }

  let color = "black";
  switch (source.type) {
    case "add-ingredient":
      color = evenOdd ? "red" : "green";
      break;
    case "pour-solvent":
      color = "blue";
      break;
  }

  if (pending) {
    color = Color(color).lighten(0.4).hex();
  }

  const path = line.points.reduce(
    (str, p) => `${str} L${p.x},${p.y}`,
    `M ${points[0].x} ${points[0].y} `
  );

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={(highlight ? 0.8 : 0.4) / scale}
      fill="none"
      onMouseOver={onPathMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

interface PlotLine {
  points: PointArray;
  source: PlotItem;
  evenOdd: boolean;
}

function resultToPlotLines(
  committed: PlotPoint[],
  pending: PlotPoint[],
  trim = 4
) {
  let currentLine: PlotLine | null = null;
  let sourceCounter = 0;

  const commitedLines: PlotLine[] = [];
  const pendingLines: PlotLine[] = [];

  let lastSource: PlotItem | null = null;

  for (const point of committed) {
    if (currentLine == null || currentLine.source != point.source) {
      if (lastSource == null || lastSource !== point.source) {
        sourceCounter++;
        lastSource = point.source;
      }
      currentLine = {
        points: [],
        source: point.source,
        evenOdd: sourceCounter % 2 === 1,
      };
      commitedLines.push(currentLine);
    }

    currentLine.points.push(point);
  }

  currentLine = null;

  for (const point of pending) {
    if (currentLine == null || currentLine.source != point.source) {
      if (lastSource == null || lastSource !== point.source) {
        sourceCounter++;
        lastSource = point.source;
      }
      currentLine = {
        points: [],
        source: point.source,
        evenOdd: sourceCounter % 2 === 1,
      };
      pendingLines.push(currentLine);
    }

    currentLine.points.push(point);
  }

  if (trim > 1) {
    for (const line of commitedLines) {
      line.points = keepEveryK(line.points, trim, true);
    }
    for (const line of pendingLines) {
      line.points = keepEveryK(line.points, trim, true);
    }
  }

  return [commitedLines, pendingLines];
}

export default Plot;
