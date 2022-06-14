import React from "react";

import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { Vector2 } from "@/vector2";

export interface PlotSvg {
  className?: string;
  width: number;
  height: number;
  scale: number;
  offset: Vector2;
  children: React.ReactNode;
}

const PlotSvg = ({
  className,
  width,
  height,
  scale,
  offset,
  children,
}: PlotSvg) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* In theory all these transforms can be done in one go, but neither order seems to work when combining them */}
      <g transform={`scale(${scale})`}>
        <g transform={`translate(${MAP_EXTENT_RADIUS}, ${MAP_EXTENT_RADIUS})`}>
          <g transform="scale(1, -1)">
            <g transform={`translate(${offset.x}, ${offset.y})`}>{children}</g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default PlotSvg;
