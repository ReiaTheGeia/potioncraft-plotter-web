import React from "react";
import { TextField, Typography } from "@mui/material";

import { useObservation } from "@/hooks/observe";

import { StirCauldronPlotItem } from "@/services/plotter/types";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";
import IncDecSlider from "@/components/IncDecSlider";

export interface StirCauldronPlotListItemProps {
  item: PlotBuilderItem<StirCauldronPlotItem>;
}

const StirCauldronPlotListItem = ({ item }: StirCauldronPlotListItemProps) => {
  const distance = useObservation(item.distance$);
  const [inputDistance, setInputDistance] = React.useState<string | null>(null);

  const onTextFieldChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setInputDistance(e.target.value);
      item.setDistance(asNumber);
    },
    [item]
  );
  const onTextFieldBlur = React.useCallback(() => {
    setInputDistance(null);
  }, []);
  const onDistanceChange = React.useCallback(
    (value: number) => {
      item.setDistance(Math.max(0, Number(value.toFixed(3))));
    },
    [item]
  );

  return (
    <div>
      <div>
        <Typography variant="overline">Stir Cauldron</Typography>
      </div>
      <TextField
        label="Distance"
        value={inputDistance ?? distance ?? ""}
        onChange={onTextFieldChange}
        onBlur={onTextFieldBlur}
      />
      <IncDecSlider
        value={distance ?? 0}
        rate={10}
        onChange={onDistanceChange}
      />
    </div>
  );
};

export default StirCauldronPlotListItem;
