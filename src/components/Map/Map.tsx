import React from "react";
import { styled } from "@mui/material";

import { Vec2Zero } from "@/vector2";
import { degreesToRadians } from "@/utils";
import { SizeZero } from "@/size";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { useObservation } from "@/hooks/observe";

import { PotionMap } from "@/services/potion-maps/PotionMap";
import {
  DangerZonePartMapEntity,
  ExperienceBonusMapEntity,
  MapEntity,
  PotionEffectMapEntity,
  VortexMapEntity,
} from "@/services/potion-maps/types";

import { IMapViewModel } from "./MapViewModel";

export interface MapProps {
  className?: string;
  map: PotionMap;
  viewModel: IMapViewModel;
}

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#DABE99",
  overflow: "hidden",
}));

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

const MapSlotSrc = require("@/assets/MapSlot.png");

const PotionMapComponent = ({ className, map, viewModel }: MapProps) => {
  const { width, height } = useObservation(viewModel.viewportSize$) ?? SizeZero;
  const offset = useObservation(viewModel.viewOffset$) ?? Vec2Zero;
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
        // Map border
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 0.2;
        ctx.moveTo(-60, -60);
        ctx.lineTo(-60, 60);
        ctx.lineTo(60, 60);
        ctx.lineTo(60, -60);
        ctx.lineTo(-60, -60);
        ctx.stroke();

        // ctx.beginPath();
        // ctx.fillStyle = "blue";
        // ctx.arc(0, 0, POTION_RADIUS, 0, 2 * Math.PI);
        // ctx.fill();

        ctx.save();
        const img = makeImg(MapSlotSrc);
        const mapSlotW = img.width / 100;
        const mapSlotH = img.height / 100;
        ctx.scale(1, -1);
        ctx.translate(-mapSlotW / 2, -mapSlotH / 2 - 0.19);
        ctx.drawImage(img, 0, 0, mapSlotW, mapSlotH);
        ctx.restore();

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
    case "ExperienceBonus":
      renderExperienceBonusEntity(ctx, entity);
      return;
    case "Vortex":
      renderVortexEntity(ctx, entity);
      return;
  }
}

const DangerZoneImageSrces: Record<string, string> = {
  Bone1: require("@/assets/danger-zone-parts/Bone1.png"),
  Bone2: require("@/assets/danger-zone-parts/Bone2.png"),
  Fang1: require("@/assets/danger-zone-parts/Fang1.png"),
  Fang2: require("@/assets/danger-zone-parts/Fang2.png"),
  Skull1: require("@/assets/danger-zone-parts/Skull1.png"),
};

function renderDangerZonePart(
  ctx: CanvasRenderingContext2D,
  entity: DangerZonePartMapEntity
) {
  ctx.save();

  ctx.translate(entity.x, entity.y);
  ctx.rotate(degreesToRadians(entity.angle));

  // switch (entity.prefab) {
  //   case "Fang1":
  //     // 0.1226418, 0.400135
  //     ctx.fillRect(-0.1226 / 2 - 0.0085, -0.4001 / 2 + 0.0116, 0.1226, 0.4001);
  //     break;
  //   case "Fang2":
  //     // 0.1371522, 0.2445218
  //     ctx.fillRect(-0.1372 / 2 + 0.0031, -0.2445 / 2 + 0.0097, 0.1372, 0.2445);
  //     break;
  //   case "Bone1":
  //     // 0.1287996, 0.6983229
  //     ctx.fillRect(-0.1288 / 2 - 0.0196, -0.6983 / 2 + 0.0052, 0.1288, 0.6983);
  //     break;
  //   case "Bone2":
  //     // 0.1529365, 0.7249526
  //     ctx.fillRect(-0.1529 / 2 - 0.00042, -0.725 / 2 + 0.0016, 0.1529, 0.725);
  //     break;
  //   case "Skull1":
  //   default:
  //     ctx.beginPath();
  //     ctx.arc(0, 0, 0.24, 0, 2 * Math.PI);
  //     ctx.fill();
  //     break;
  // }

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
  Acid: require("@/assets/potion-effects/Acid.webp"),
  Berserker: require("@/assets/potion-effects/Berserker.webp"),
  Bounce: require("@/assets/potion-effects/Bounce.webp"),
  Charm: require("@/assets/potion-effects/Charm.webp"),
  Crop: require("@/assets/potion-effects/Crop.webp"),
  Explosion: require("@/assets/potion-effects/Explosion.webp"),
  Fire: require("@/assets/potion-effects/Fire.webp"),
  Fly: require("@/assets/potion-effects/Fly.webp"),
  Frost: require("@/assets/potion-effects/Frost.webp"),
  Growth: require("@/assets/potion-effects/Growth.webp"),
  Hallucinations: require("@/assets/potion-effects/Hallucinations.webp"),
  Healing: require("@/assets/potion-effects/Healing.webp"),
  Invisibility: require("@/assets/potion-effects/Invisibility.webp"),
  Libido: require("@/assets/potion-effects/Libido.webp"),
  Light: require("@/assets/potion-effects/Light.webp"),
  Lightning: require("@/assets/potion-effects/Lightning.webp"),
  Mana: require("@/assets/potion-effects/Mana.webp"),
  Necromancy: require("@/assets/potion-effects/Necromancy.webp"),
  Poison: require("@/assets/potion-effects/Poison.webp"),
  SharpVision: require("@/assets/potion-effects/SharpVision.webp"),
  Sleep: require("@/assets/potion-effects/Sleep.webp"),
  SlowDown: require("@/assets/potion-effects/SlowDown.webp"),
  StoneSkin: require("@/assets/potion-effects/StoneSkin.webp"),
};

const EffectSlotSrc = require("@/assets/EffectSlot.png");
function renderPotionEffectEntity(
  ctx: CanvasRenderingContext2D,
  entity: PotionEffectMapEntity
) {
  // Line from effect to origin
  ctx.save();
  var grad = ctx.createLinearGradient(entity.x, entity.y, 0, 0);
  grad.addColorStop(0, "#D2AA7B");
  grad.addColorStop(1, "transparent");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  ctx.moveTo(entity.x, entity.y);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.restore();

  // Effect artwork
  ctx.save();

  ctx.translate(entity.x, entity.y);

  // ctx.beginPath();
  // ctx.fillStyle = "red";
  // ctx.arc(0, 0, POTION_RADIUS, 0, 2 * Math.PI);
  // ctx.fill();

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

const ExperienceBonusImagesSrc: Record<string, string> = {
  Little: require("@/assets/experience-bonus/xp-small.png"),
  Medium: require("@/assets/experience-bonus/xp-medium.png"),
  Large: require("@/assets/experience-bonus/xp-large.png"),
};

function renderExperienceBonusEntity(
  ctx: CanvasRenderingContext2D,
  entity: ExperienceBonusMapEntity
) {
  ctx.save();
  ctx.translate(entity.x, entity.y);

  const src = ExperienceBonusImagesSrc[entity.prefab];
  if (src) {
    const img = makeImg(src);
    const w = img.width / 200;
    const h = img.height / 200;
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  }

  // ctx.beginPath();
  // ctx.fillStyle = "green";
  // ctx.arc(0, 0, 0.3, 0, 2 * Math.PI);
  // ctx.fill();

  ctx.restore();
}

const VortexImagesSrc: Record<string, string> = {
  Large: require("@/assets/vortexes/Vortex Large Idle.png"),
  Medium: require("@/assets/vortexes/Vortex Medium Idle.png"),
};

function renderVortexEntity(
  ctx: CanvasRenderingContext2D,
  entity: VortexMapEntity
) {
  ctx.save();
  ctx.translate(entity.x, entity.y);

  // let radius = 0;
  // switch (entity.prefab) {
  //   case "Large":
  //     radius = 1.65;
  //     break;
  //   case "Medium":
  //     radius = 1.25;
  //     break;
  // }

  // if (radius > 0) {
  //   ctx.beginPath();
  //   ctx.fillStyle = "purple";
  //   ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  //   ctx.fill();
  // }

  // const backgroundSrc = VortexBackgroundImagesSrc[entity.prefab];
  // if (backgroundSrc) {
  //   const img = makeImg(backgroundSrc);
  //   const w = img.width / 150;
  //   const h = img.height / 150;
  //   ctx.save();
  //   ctx.scale(1, -1);
  //   ctx.translate(-w / 2, -h / 2);
  //   ctx.drawImage(img, 0, 0, w, h);
  //   ctx.restore();
  // }

  const src = VortexImagesSrc[entity.prefab];
  if (src) {
    const img = makeImg(src);
    const w = img.width / 100;
    const h = img.height / 100;
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(-w / 2, -h / 2);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  }

  ctx.restore();
}
