import React from "react";

import { styled } from "@mui/material";

import { PotionMap } from "@/services/potion-bases/PotionMap";
import { useObservation } from "@/hooks/observe";
import { IMapViewModel } from "./MapViewModel";
import { PointZero } from "@/points";
import { MAP_EXTENT_RADIUS } from "@/game-settings";

export interface MapProps {
  className?: string;
  map: PotionMap;
  viewModel: IMapViewModel;
}

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#DABE99",
  overflow: "auto",
  "& .map-svg": {
    display: "block",
  },
}));

const PotionMapComponent = ({ className, map, viewModel }: MapProps) => {
  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;

  const left = -MAP_EXTENT_RADIUS + offset.x;
  const top = -MAP_EXTENT_RADIUS + offset.y;
  const width = MAP_EXTENT_RADIUS * 2 * (1 / scale);
  const height = MAP_EXTENT_RADIUS * 2 * (1 / scale);

  const svgContent = React.useMemo(
    () =>
      map.entities.map((entity, i) => (
        <circle key={i} cx={entity.x} cy={entity.y} r={0.3} fill="black" />
      )),
    [map.entities]
  );

  return (
    <Root className={className}>
      <svg
        className="map-svg"
        width="100%"
        height="100%"
        viewBox={`${left} ${top} ${width} ${height}`}
        transform="scale(1, -1)"
      >
        {svgContent}
        <rect
          x={-60}
          y={-60}
          width={120}
          height={120}
          stroke="red"
          fill="none"
          strokeWidth={0.2 / scale}
        />
      </svg>
    </Root>
  );
};

export default PotionMapComponent;
