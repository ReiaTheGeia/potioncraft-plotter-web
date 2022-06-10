import React from "react";
import { styled } from "@mui/material";

import { PotionMap } from "@/services/potion-bases/PotionMap";

import { IMapViewModel } from "./MapViewModel";
import { useObservation } from "@/hooks/observe";
import { SizeZero } from "@/size";
import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import { MapEntity } from "@/services/potion-bases/types";
import Context from "@mui/base/TabsUnstyled/TabsContext";
import { PointZero } from "@/points";
import { forEach } from "lodash";

export interface MapProps {
  className?: string;
  map: PotionMap;
  viewModel: IMapViewModel;
}

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#DABE99",
  overflow: "hidden",
}));

const PotionMapComponent = ({ className, map, viewModel }: MapProps) => {
  const { width, height } = useObservation(viewModel.viewportSize$) ?? SizeZero;
  const offset = useObservation(viewModel.viewOffset$) ?? PointZero;
  const scale = useObservation(viewModel.viewScale$) ?? 1;

  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(
    null
  );

  const entities = map.entities;

  React.useEffect(() => {
    if (!canvasRef) {
      return;
    }

    const id = requestAnimationFrame(() => {
      const ctx = canvasRef.getContext("2d")!;

      ctx.clearRect(0, 0, width, height);

      transformToMap(ctx, scale, offset.x, offset.y, () => {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 0.2;
        ctx.moveTo(-60, -60);
        ctx.lineTo(-60, 60);
        ctx.lineTo(60, 60);
        ctx.lineTo(60, -60);
        ctx.lineTo(-60, -60);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc(0, 0, POTION_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        for (const entity of entities) {
          renderEntity(ctx, entity);
        }
      });
    });

    return () => cancelAnimationFrame(id);
  }, [canvasRef, entities, width, height, offset.x, offset.y, scale]);

  return (
    <Root className={className}>
      <canvas ref={(ref) => setCanvasRef(ref)} width={width} height={height} />
    </Root>
  );
};

export default PotionMapComponent;

function transformToMap(
  ctx: CanvasRenderingContext2D,
  zoomFactor: number,
  offsetX: number,
  offsetY: number,
  handler: () => void
) {
  ctx.save();
  ctx.scale(zoomFactor, zoomFactor);

  ctx.translate(MAP_EXTENT_RADIUS, MAP_EXTENT_RADIUS);

  ctx.scale(1, -1);

  // Offset is in map units, so apply after the inversion of y.
  ctx.translate(offsetX, offsetY);

  handler();
  ctx.restore();
}

function renderEntity(ctx: CanvasRenderingContext2D, entity: MapEntity) {
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc(entity.x, entity.y, 0.3, 0, 2 * Math.PI);
  ctx.fill();
}
