import React from "react";

import { Card, CardContent, Typography } from "@mui/material";

import { uniq } from "lodash";

import { EntityDefs } from "@/services/potion-maps/entity-defs";

import { PlotPoint } from "@/services/plotter/types";

import FixedValue from "./FixedValue";

export interface PointDetailsProps {
  point: PlotPoint;
}

const PointDetails = ({ point }: PointDetailsProps) => {
  const touchedItems = uniq(
    point.entities.map((x) => EntityDefs[x.entityType].getFriendlyName(x))
  );
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">Point at mouse</Typography>
        <Typography variant="overline">
          <FixedValue value={point.x} />, <FixedValue value={point.y} />
        </Typography>
        {touchedItems.length > 0 && (
          <>
            <Typography>Bottle touches:</Typography>
            <Typography variant="overline">
              {touchedItems.join(", ")}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PointDetails;
