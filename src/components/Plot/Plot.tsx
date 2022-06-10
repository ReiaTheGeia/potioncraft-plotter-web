import React from "react";
import Color from "color";
import { styled } from "@mui/material";

import { useObservation } from "@/hooks/observe";
import { PointZero } from "@/points";
import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import { PointArray } from "@/point-array";
import { keepEveryK } from "@/utils";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import {
  IPlotViewModel,
  PlotViewModelContext,
  usePlotViewModel,
} from "./PlotViewModel";

import PlotDetails from "./components/PlotDetails";
import StepDetails from "./components/StepDetails";
import { SizeZero } from "@/size";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
  viewModel: IPlotViewModel;
}

const Root = styled("div")(({ theme }) => ({
  overflow: "hidden",
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
    position: "absolute",
    left: 0,
    top: 0,
  },
}));

const Plot = ({ className, plot, viewModel }: PlotProps) => {
  const { width, height } = useObservation(viewModel.viewportSize$) ?? SizeZero;
  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;
  const inspectSource = useObservation(viewModel.mouseOverPlotItem$) ?? null;

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

  return (
    <Root className={className}>
      <PlotViewModelContext.Provider value={viewModel}>
        <svg
          className="plot-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* In theory all these transforms can be done in one go, but neither order seems to work when combining them */}
          <g transform={`scale(${scale})`}>
            <g
              transform={`translate(${MAP_EXTENT_RADIUS}, ${MAP_EXTENT_RADIUS})`}
            >
              <g transform="scale(1, -1)">
                <g transform={`translate(${offset.x}, ${offset.y})`}>
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
                </g>
              </g>
            </g>
          </g>
        </svg>
        {inspectSource && (
          <StepDetails className="inspect-source" step={inspectSource} />
        )}
        <PlotDetails className="plot-details" plot={plot} />
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
      strokeWidth={(highlight ? 5 : 2) / scale}
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
