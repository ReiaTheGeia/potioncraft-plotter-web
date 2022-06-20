import React from "react";
import { TextField, Typography } from "@mui/material";

import { useObservation } from "@/hooks/observe";

import { AddVoidSaltPlotItem } from "@/services/plotter/types";

import IncDecSlider from "@/components/IncDecSlider";
import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";

export interface AddVoidSaltPlotListItemProps {
  item: PlotBuilderItem<AddVoidSaltPlotItem>;
}
const AddVoidSaltPlotListItem = ({ item }: AddVoidSaltPlotListItemProps) => {
  const grains = useObservation(item.grains$);
  const [inputGrains, setInputGrains] = React.useState<string | null>(null);
  const [sliderGrains, setSliderGrains] = React.useState<number | null>(null);
  const onTextFieldChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setInputGrains(e.target.value);
      item.setGrains(asNumber);
    },
    [item]
  );
  const onTextFieldBlur = React.useCallback(() => {
    setInputGrains(null);
  }, []);
  const onGrainsChange = React.useCallback(
    (value: number) => {
      // Because grains can only be whole numbers, we track the slider value seperately so decimalled values can still increase and decrease
      // appropriately with the rate, making the whole length of the slider useful.
      setSliderGrains(Math.max(0, value));
      item.setGrains(Math.max(0, Math.round(value)));
    },
    [item]
  );

  return (
    <div>
      <div>
        <Typography variant="overline">Add Void Salt</Typography>
      </div>
      <TextField
        label="Grains"
        value={inputGrains ?? grains ?? ""}
        onChange={onTextFieldChange}
        onBlur={onTextFieldBlur}
      />
      <IncDecSlider
        value={sliderGrains ?? grains ?? 0}
        rate={200}
        onChange={onGrainsChange}
        onChangeCommitted={() => setSliderGrains(null)}
      />
    </div>
  );
};

export default AddVoidSaltPlotListItem;
