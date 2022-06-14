import React from "react";

import { Card, CardContent } from "@mui/material";

import {
  MapEntity,
  PotionEffectMapEntity,
  VortexMapEntity,
} from "@/services/potion-maps/types";

export interface StepDetailsProps {
  className?: string;
  entity: MapEntity;
}

const EntityDetails = ({ entity, className }: StepDetailsProps) => {
  let content: React.ReactNode;
  switch (entity.entityType) {
    case "PotionEffect":
      content = <PotionEffectMapEntityDetails entity={entity} />;
      break;
    case "Vortex":
      content = <VortexMapEntityDetails entity={entity} />;
      break;
    default:
      return null;
  }

  return (
    <Card className={className} variant="outlined">
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default EntityDetails;

const PotionEffectMapEntityDetails = ({
  entity,
}: {
  entity: PotionEffectMapEntity;
}) => {
  return (
    <div>
      {entity.effect} ({entity.x}, {entity.y})
    </div>
  );
};

const VortexMapEntityDetails = ({ entity }: { entity: VortexMapEntity }) => {
  return (
    <div>
      Vortex ({entity.x}, {entity.y})
    </div>
  );
};
