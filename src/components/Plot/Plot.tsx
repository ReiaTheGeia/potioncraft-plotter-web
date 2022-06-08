import React from "react";
import Color from "color";

import { useDICreate, useDIDependency } from "@/container";

import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { PointArray } from "@/point-array";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import PanZoomHandler from "./components/PanZoomHandler";
import { PlotViewModel, PlotViewModelContext } from "./PlotViewModel";
import { useObservation } from "@/hooks/observe";
import { PointZero } from "@/points";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
}

const Plot = ({ className, plot }: PlotProps) => {
  const viewModel = useDICreate(PlotViewModel);

  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;

  const committedLines = resultToPlotLines(plot.committedPoints);
  const pendingLines = resultToPlotLines(plot.pendingPoints);

  let left = -MAP_EXTENT_RADIUS + offset.x;
  let top = -MAP_EXTENT_RADIUS + offset.y;
  let width = MAP_EXTENT_RADIUS * 2 * (1 / scale);
  let height = MAP_EXTENT_RADIUS * 2 * (1 / scale);

  return (
    <div className={className}>
      <PlotViewModelContext.Provider value={viewModel}>
        <PanZoomHandler>
          <svg viewBox={`${left} ${top} ${width} ${height}`}>
            <rect
              x={-60}
              y={-60}
              width={120}
              height={120}
              stroke="red"
              fill="none"
              strokeWidth={0.2}
            />
            <circle cx={0} cy={0} r={0.2} fill="blue" />
            <g transform="scale(1, -1)">
              {committedLines.map((line, i) => (
                <PlotLine key={i} line={line} pending={false} />
              ))}
              {pendingLines.map((line, i) => (
                <PlotLine key={i} line={line} pending={true} />
              ))}
            </g>
          </svg>
        </PanZoomHandler>
      </PlotViewModelContext.Provider>
    </div>
  );
};

interface PlotLineProps {
  line: PlotLine;
  pending: boolean;
}
const PlotLine = ({ line, pending }: PlotLineProps) => {
  const [mouseOver, setMouseOver] = React.useState(false);
  const { points, source } = line;
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  if (points.length === 0) {
    return null;
  }

  let color = "black";
  switch (source.type) {
    case "add-ingredient":
      color =
        ingredientRegistry.getIngredient(source.ingredientId)?.color ?? "black";
      break;
    case "pour-solvent":
      color = "blue";
      break;
  }

  if (pending) {
    color = Color(color).desaturate(0.5).lighten(0.25).hex();
  }

  const path = line.points.reduce(
    (str, p) => `${str} L${p.x},${p.y}`,
    `M ${points[0].x} ${points[0].y} `
  );

  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={mouseOver ? 0.6 : 0.4}
      fill="none"
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
    />
  );
};

interface PlotLine {
  points: PointArray;
  source: PlotItem;
}

function resultToPlotLines(points: PlotPoint[]) {
  let currentLine: PlotLine | null = null;
  const lines: PlotLine[] = [];
  for (const point of points) {
    if (currentLine == null || currentLine.source != point.source) {
      currentLine = {
        points: [],
        source: point.source,
      };
      lines.push(currentLine);
    }

    currentLine.points.push(point);
  }

  return lines;
}

export default Plot;
