import React from "react";
import { TextField, Typography } from "@mui/material";

import { useObservation } from "@/hooks/observe";

import { SetPositionPlotBuilderItem } from "@/components/PlotBuilderView/builder";

export interface SetPositionPlotListItemProps {
  item: SetPositionPlotBuilderItem;
}
const SetPositionPlotListItem = ({ item }: SetPositionPlotListItemProps) => {
  const [xInput, setXInput] = React.useState<string | null>(null);
  const [yInput, setYInput] = React.useState<string | null>(null);

  const x = useObservation(item.x$);
  const y = useObservation(item.y$);

  const onXChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setXInput(e.target.value);
      item.setX(asNumber);
    },
    [item]
  );

  const onYChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setYInput(e.target.value);
      item.setY(asNumber);
    },
    [item]
  );

  const onXBlur = React.useCallback(() => setXInput(null), []);
  const onYBlur = React.useCallback(() => setYInput(null), []);

  return (
    <div>
      <div>
        <Typography variant="overline">Teleport</Typography>
      </div>
      <TextField
        label="X"
        value={xInput ?? x ?? ""}
        onChange={onXChange}
        onBlur={onXBlur}
      />
      <TextField
        label="Y"
        value={yInput ?? y ?? ""}
        onChange={onYChange}
        onBlur={onYBlur}
      />
    </div>
  );
};

export default SetPositionPlotListItem;
