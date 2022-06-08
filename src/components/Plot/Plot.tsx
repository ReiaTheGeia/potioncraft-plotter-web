import React from "react";
import Color from "color";
import { styled } from "@mui/material";

import { useDICreate, useDIDependency } from "@/container";

import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import { PointArray } from "@/point-array";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import PanZoomHandler from "./components/PanZoomHandler";
import {
  PlotViewModel,
  PlotViewModelContext,
  usePlotViewModel,
} from "./PlotViewModel";
import { useObservation } from "@/hooks/observe";
import { PointZero } from "@/points";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
}

const Root = styled("div")({
  backgroundColor: "#DABE99",
  overflow: "auto",
  "& .plot-svg": {
    display: "block",
  },
});

const Plot = ({ className, plot }: PlotProps) => {
  const viewModel = useDICreate(PlotViewModel);

  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;

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
              <PlotLine key={i} line={line} pending={false} />
            ))}
            {pendingLines.map((line, i) => (
              <PlotLine key={i} line={line} pending={true} />
            ))}
          </svg>
        </PanZoomHandler>
      </PlotViewModelContext.Provider>
    </Root>
  );
};

interface PlotLineProps {
  line: PlotLine;
  pending: boolean;
}
const PlotLine = ({ line, pending }: PlotLineProps) => {
  const viewModel = usePlotViewModel();
  const scale = useObservation(viewModel.viewScale$) ?? 1;
  const [mouseOver, setMouseOver] = React.useState(false);
  const { points, source, evenOdd } = line;
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  if (points.length === 0) {
    return null;
  }

  let color = "black";
  switch (source.type) {
    case "add-ingredient":
      // color =
      //   ingredientRegistry.getIngredient(source.ingredientId)?.color ?? "black";
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
      strokeWidth={(mouseOver ? 0.8 : 0.4) / scale}
      fill="none"
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
    />
  );
};

interface PlotLine {
  points: PointArray;
  source: PlotItem;
  evenOdd: boolean;
}

function resultToPlotLines(committed: PlotPoint[], pending: PlotPoint[]) {
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

  return [commitedLines, pendingLines];
}

export default Plot;
