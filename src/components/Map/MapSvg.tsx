import React from "react";

import { styled } from "@mui/material";

import { useObservation } from "@/hooks/observe";
import { usePromise } from "@/hooks/promise";

import { PointZero } from "@/points";
import { MAP_EXTENT_RADIUS } from "@/game-settings";

import {
  DangerZonePartMapEntity,
  MapEntity,
  PotionEffectMapEntity,
} from "@/services/potion-bases/types";
import { PotionMap } from "@/services/potion-bases/PotionMap";

import { IMapViewModel } from "./MapViewModel";

export interface MapProps {
  className?: string;
  map: PotionMap;
  viewModel: IMapViewModel;
}

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#DABE99",
  overflow: "hidden",
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
        <MapEntityComponent key={i} entity={entity} />
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

interface MapEntityComponentProps {
  entity: MapEntity;
}
const MapEntityComponent = ({ entity }: MapEntityComponentProps) => {
  switch (entity.entityType) {
    case "DangerZonePart":
      return <DangerZonePartMapEntityComponent entity={entity} />;
    case "PotionEffect":
      return <PotionEffectMapEntityComponent entity={entity} />;
  }

  return <circle cx={entity.x} cy={entity.y} r={0.3} fill="black" />;
};

interface DangerZonePartMapEntityComponentProps {
  entity: DangerZonePartMapEntity;
}

function makeImg(src: string): HTMLImageElement {
  const img = new Image();
  img.onerror = console.error.bind(console);
  img.src = src;
  return img;
}

const measureImageCache: Record<
  string,
  Promise<{ width: number; height: number }> | undefined
> = {};
function getImageSize(src: string): Promise<{ width: number; height: number }> {
  let p = measureImageCache[src];
  if (p != null) {
    return p;
  }

  p = new Promise((resolve, reject) => {
    const img = makeImg(src);
    img.onload = () => resolve({ width: img.width, height: img.height });
  });
  measureImageCache[src] = p;
  return p;
}

const DangerZoneImageSrces: Record<string, string> = {
  Bone1: require("./assets/danger-zone-parts/Bone1.png"),
  Bone2: require("./assets/danger-zone-parts/Bone2.png"),
  Fang1: require("./assets/danger-zone-parts/Fang1.png"),
  Fang2: require("./assets/danger-zone-parts/Fang2.png"),
  Skull1: require("./assets/danger-zone-parts/Skull1.png"),
};

const DangerZonePartMapEntityComponent = ({
  entity,
}: DangerZonePartMapEntityComponentProps) => {
  const imgSrc = DangerZoneImageSrces[entity.prefab];
  const { width, height } = usePromise(getImageSize(imgSrc)) ?? {
    width: 0,
    height: 0,
  };
  const imgWidth = width / 130;
  const imgHeight = height / 130;
  return (
    <g transform={`translate(${entity.x}, ${entity.y})`}>
      <g transform={`rotate(${entity.angle}, 0, 0)`}>
        <image
          href={imgSrc}
          x={-imgWidth / 2}
          y={-imgHeight / 2}
          width={imgWidth}
          height={imgHeight}
          transform={`scale(1, -1)`}
        />
      </g>
    </g>
  );
};

interface PotionEffectMapEntityComponentProps {
  entity: PotionEffectMapEntity;
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

const PotionEffectMapEntityComponent = ({
  entity,
}: PotionEffectMapEntityComponentProps) => {
  const slotSrc = EffectSlotSrc;
  const imgSrc = PotionEffectImageSrces[entity.effect];
  const { width, height } = usePromise(getImageSize(imgSrc)) ?? {
    width: 0,
    height: 0,
  };
  const { width: slotWidthRaw, height: slotHeightRaw } = usePromise(
    getImageSize(EffectSlotSrc)
  ) ?? {
    width: 0,
    height: 0,
  };
  const imgWidth = width / 30;
  const imgHeight = height / 30;
  const slotWidth = slotWidthRaw / 100;
  const slotHeight = slotHeightRaw / 100;
  return (
    <g transform={`translate(${entity.x}, ${entity.y})`}>
      <image
        href={slotSrc}
        x={-slotWidth / 2}
        y={-slotHeight / 2 - 0.22}
        width={slotWidth}
        height={slotHeight}
        transform={`scale(1, -1)`}
      />
      <image
        href={imgSrc}
        x={-imgWidth / 2}
        y={-imgHeight / 2}
        width={imgWidth}
        height={imgHeight}
        transform={`scale(1, -1)`}
      />
    </g>
  );
};

export default PotionMapComponent;
