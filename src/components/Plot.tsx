import React from "react";

import { PlotResult } from "@/services/plotter/types";
import { MAP_EXTENT_RADIUS } from "@/game-settings";

export interface PlotProps {
  className?: string;
  plot: PlotResult;
}

const Plot = ({ className, plot }: PlotProps) => {
  const commitPath =
    plot.committedPoints.length > 0
      ? plot.committedPoints.reduce(
          (str, p) => `${str} L${p.x},${p.y}`,
          `M ${plot.committedPoints[0].x} ${plot.committedPoints[0].y} `
        )
      : "";

  const pendingPath =
    plot.pendingPoints.length > 0
      ? plot.pendingPoints.reduce(
          (str, p) => `${str} L${p.x},${p.y}`,
          `M ${plot.pendingPoints[0].x} ${plot.pendingPoints[0].y} `
        )
      : "";
  return (
    <svg
      width="500px"
      height="500px"
      className={className}
      viewBox={`${-MAP_EXTENT_RADIUS} ${-MAP_EXTENT_RADIUS} ${
        MAP_EXTENT_RADIUS * 2
      } ${MAP_EXTENT_RADIUS * 2}`}
    >
      <path d={commitPath} stroke="black" fill="none" strokeWidth={0.2} />
      <path d={pendingPath} stroke="lightgrey" fill="none" strokeWidth={0.2} />
      {/* <path
        d="M 0,0 C 0.0001,0 0,0 0.5,1.25 C 0.9999999,2.5 0.9999,2.5 1,2.5 C 1.0001,2.5 -1.0001,2.5 -1,2.5 C -0.9999,2.5 -1,2.5 -0.5,3.75 C 0,5 0.0001,5 0,5"
        stroke="green"
        fill="none"
        opacity={0.8}
        strokeWidth={0.2}
      /> */}
    </svg>
  );
};

export default Plot;
