import React from "react";
import Color from "color";
import { styled } from "@mui/material";

import { Vec2Zero } from "@/vector2";
import { SizeZero } from "@/size";
import { POTION_RADIUS } from "@/game-settings";
import { PointArray } from "@/point-array";
import { keepEveryK } from "@/utils";

import { useObservation } from "@/hooks/observe";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";

import PlotSvg from "../PlotSvg";

import { IPlotViewModel } from "./PlotViewModel";

import { last } from "lodash";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
  viewModel: IPlotViewModel;
}

const Root = styled("div")(({ theme }) => ({
  overflow: "hidden",
  position: "relative",
  "& .plot-svg": {
    display: "block",
    position: "absolute",
    left: 0,
    top: 0,
  },
  "& .bottle-preview": {
    pointerEvents: "none",
  },
}));

const Plot = ({ className, plot, viewModel }: PlotProps) => {
  const { width, height } = useObservation(viewModel.viewportSize$) ?? SizeZero;
  const offset = useObservation(viewModel.viewOffset$) ?? Vec2Zero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;
  const mouseOverItem = useObservation(viewModel.mouseOverPlotItem$) ?? null;
  const mouseOverPoint = useObservation(viewModel.mouseOverPlotPoint) ?? null;

  const lastCommitPoint = last(plot.committedPoints) ?? null;

  const onLineMouseOver = React.useCallback(
    (line: PlotLine) => {
      viewModel.onMouseOverPlotItem(line.source);
    },
    [viewModel]
  );

  const onLineMouseOut = React.useCallback(() => {
    viewModel.onMouseOverPlotItem(null);
  }, [viewModel]);

  const [committedLines, pendingLines] = resultToPlotLines(
    plot.committedPoints,
    plot.pendingPoints
  );

  return (
    <Root className={className}>
      <PlotSvg
        className="plot-svg"
        width={width}
        height={height}
        offset={offset}
        scale={scale}
      >
        {committedLines.map((line, i) => (
          <PlotLine
            key={i}
            line={line}
            pending={false}
            scale={scale}
            highlight={line.source === mouseOverItem}
            onMouseOver={onLineMouseOver}
            onMouseOut={onLineMouseOut}
          />
        ))}
        {pendingLines.map((line, i) => (
          <PlotLine
            key={i}
            line={line}
            pending={true}
            scale={scale}
            highlight={line.source === mouseOverItem}
            onMouseOver={onLineMouseOver}
            onMouseOut={onLineMouseOut}
          />
        ))}
        {lastCommitPoint && (
          <circle
            className="bottle-preview"
            cx={lastCommitPoint.x}
            cy={lastCommitPoint.y}
            r={POTION_RADIUS}
            fill="blue"
            opacity={0.2}
          />
        )}
        {mouseOverPoint && (
          <circle
            className="bottle-preview"
            cx={mouseOverPoint.x}
            cy={mouseOverPoint.y}
            r={POTION_RADIUS}
            fill="blue"
            opacity={0.2}
          />
        )}
      </PlotSvg>
    </Root>
  );
};

interface PlotLineProps {
  scale: number;
  line: PlotLine;
  pending: boolean;
  highlight: boolean;
  onMouseOver(line: PlotLine): void;
  onMouseOut(): void;
}
const PlotLine = ({
  scale,
  line,
  pending,
  highlight,
  onMouseOver,
  onMouseOut,
}: PlotLineProps) => {
  const { points, source, evenOdd } = line;

  const onPathMouseOver = React.useCallback(() => {
    onMouseOver(line);
  }, [line, onMouseOver]);

  const onPathMouseOut = React.useCallback(() => {
    onMouseOut();
  }, [onMouseOut]);

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
    case "heat-vortex":
      color = "purple";
      break;
  }

  if (pending) {
    color = Color(color).lighten(0.6).hex();
  }

  const path = line.points.reduce(
    (str, p) => `${str} L${p.x},${p.y}`,
    `M ${points[0].x} ${points[0].y} `
  );

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={(highlight ? 6 : 3) / scale}
      fill="none"
      onMouseOver={onPathMouseOver}
      onMouseOut={onPathMouseOut}
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
