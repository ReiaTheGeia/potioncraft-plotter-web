import React from "react";
import { styled } from "@mui/material";

import { PotionMap } from "@/services/potion-bases/PotionMap";

import { IMapViewModel } from "./MapViewModel";
import { useObservation } from "@/hooks/observe";
import { SizeZero } from "@/size";
import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import {
  DangerZonePartMapEntity,
  MapEntity,
  PotionEffectMapEntity,
} from "@/services/potion-bases/types";
import Context from "@mui/base/TabsUnstyled/TabsContext";
import { PointZero } from "@/points";
import { forEach } from "lodash";
import { degreesToRadians } from "@/utils";

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
  switch (entity.entityType) {
    case "DangerZonePart":
      renderDangerZonePart(ctx, entity);
      return;
    case "PotionEffect":
      renderPotionEffectEntity(ctx, entity);
      return;
    default: {
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.arc(entity.x, entity.y, 0.3, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }
  }
}

const imgCache = new Map<string, HTMLImageElement>();
function makeImg(src: string): HTMLImageElement {
  if (imgCache.has(src)) {
    return imgCache.get(src)!;
  }

  const img = new Image();
  img.onerror = console.error.bind(console);
  img.src = src;
  imgCache.set(src, img);
  return img;
}

const DangerZoneImageSrces: Record<string, string> = {
  Bone1: require("./assets/danger-zone-parts/Bone1.png"),
  Bone2: require("./assets/danger-zone-parts/Bone2.png"),
  Fang1: require("./assets/danger-zone-parts/Fang1.png"),
  Fang2: require("./assets/danger-zone-parts/Fang2.png"),
  Skull1: require("./assets/danger-zone-parts/Skull1.png"),
};

function renderDangerZonePart(
  ctx: CanvasRenderingContext2D,
  entity: DangerZonePartMapEntity
) {
  ctx.save();

  ctx.translate(entity.x, entity.y);
  ctx.rotate(degreesToRadians(entity.angle));

  const src = DangerZoneImageSrces[entity.prefab];
  if (src) {
    const img = makeImg(src);
    const w = img.width / 130;
    const h = img.height / 130;
    ctx.scale(1, -1);
    ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(img, 0, 0, w, h);
  }

  ctx.restore();
}

const PotionEffectImageSrces: Record<string, string> = {
  Acid: require("./assets/potion-effects/Acid.webp"),
  Berserker: require("./assets/potion-effects/Berserker.webp"),
  Bounce: require("./assets/potion-effects/Bounce.webp"),
  Charm: require("./assets/potion-effects/Charm.webp"),
  Crop: require("./assets/potion-effects/Crop.webp"),
  Explosion: require("./assets/potion-effects/Explosion.webp"),
  Fire: require("./assets/potion-effects/Fire.webp"),
  Fly: require("./assets/potion-effects/Fly.webp"),
  Frost: require("./assets/potion-effects/Frost.webp"),
  Growth: require("./assets/potion-effects/Growth.webp"),
  Hallucinations: require("./assets/potion-effects/Hallucinations.webp"),
  Healing: require("./assets/potion-effects/Healing.webp"),
  Invisibility: require("./assets/potion-effects/Invisibility.webp"),
  Libido: require("./assets/potion-effects/Libido.webp"),
  Light: require("./assets/potion-effects/Light.webp"),
  Lightning: require("./assets/potion-effects/Lightning.webp"),
  Mana: require("./assets/potion-effects/Mana.webp"),
  Necromancy: require("./assets/potion-effects/Necromancy.webp"),
  Poison: require("./assets/potion-effects/Poison.webp"),
  SharpVision: require("./assets/potion-effects/SharpVision.webp"),
  Sleep: require("./assets/potion-effects/Sleep.webp"),
  SlowDown: require("./assets/potion-effects/SlowDown.webp"),
  StoneSkin: require("./assets/potion-effects/StoneSkin.webp"),
};

const EffectSlotSrc = require("./assets/EffectSlot.png");
function renderPotionEffectEntity(
  ctx: CanvasRenderingContext2D,
  entity: PotionEffectMapEntity
) {
  ctx.save();

  ctx.translate(entity.x, entity.y);

  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(0, 0, POTION_RADIUS, 0, 2 * Math.PI);
  ctx.fill();

  const container = makeImg(EffectSlotSrc);
  const containerW = container.width / 100;
  const containerH = container.height / 100;
  ctx.save();
  ctx.scale(1, -1);
  ctx.translate(-containerW / 2, -containerH / 2 - 0.2);
  ctx.drawImage(container, 0, 0, containerW, containerH);
  ctx.restore();

  const src = PotionEffectImageSrces[entity.effect];
  if (src) {
    const img = makeImg(src);
    const w = img.width / 40;
    const h = img.height / 40;
    ctx.scale(1, -1);
    ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(img, 0, 0, w, h);
  }

  ctx.restore();
}
