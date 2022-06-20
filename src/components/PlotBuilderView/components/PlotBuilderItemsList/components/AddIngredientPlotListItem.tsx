import React from "react";
import { Grid, Slider, TextField, Typography } from "@mui/material";

import { useObservation } from "@/hooks/observe";

import { IngredientId } from "@/services/ingredients/types";
import { AddIngredientPlotItem } from "@/services/plotter/types";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";
import IngredientSelector from "@/components/IngredientSelector";

export interface AddIngredientPlotListItemProps {
  item: PlotBuilderItem<AddIngredientPlotItem>;
}
const AddIngredientPlotListItem = ({
  item,
}: AddIngredientPlotListItemProps) => {
  const savedIngredientRef = React.useRef<IngredientId | null>(null);

  // Need both state (for rerender on change) and ref (to check it in a callback)
  const [isPreviewing, setIsPreviewing] = React.useState<boolean>(false);
  const isPreviewingRef = React.useRef(false);

  // Note: This is from when a transition was used to show the preview, we wanted
  // the slider to update live while the preview was not.  However, we no longer use
  // transitions as the system is now fast enough to deal without it.
  const [localGrind, setLocalGrind] = React.useState<number | null>(null);

  const [inputGrindPercent, setInputGrindPercent] = React.useState<
    string | null
  >(null);

  const ingredientId = useObservation(item.ingredientId$) ?? null;
  const grindPercent = useObservation(item.grindPercent$) ?? 0;

  const onIngredientSelectorOpen = React.useCallback(() => {
    savedIngredientRef.current = ingredientId;
    setIsPreviewing(true);
    isPreviewingRef.current = true;
  }, [ingredientId]);

  const onIngredientSelectorMouseOverItem = React.useCallback(
    (value: IngredientId) => {
      if (!isPreviewing) {
        return;
      }
      item.setIngredientId(value);
    },
    [item, isPreviewing]
  );

  const onIngredientSelectorChange = React.useCallback(
    (value: IngredientId | null) => {
      setIsPreviewing(false);
      isPreviewingRef.current = false;
      item.setIngredientId(value);
    },
    [item]
  );

  const onIngredientSelectorClose = React.useCallback(() => {
    if (isPreviewingRef.current) {
      item.setIngredientId(savedIngredientRef.current);
      setIsPreviewing(false);
      isPreviewingRef.current = false;
    }
    savedIngredientRef.current = null;
  }, [item]);

  const onGrindPercentTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value) / 100;
      if (isNaN(asNumber) || asNumber < 0 || asNumber > 1) {
        asNumber = null;
      }

      setInputGrindPercent(e.target.value);
      item.setGrindPercent(asNumber ?? 0);
    },
    [item]
  );

  const onGrindPercentBlur = React.useCallback(() => {
    setInputGrindPercent(null);
  }, []);

  const onSliderChange = React.useCallback(
    (_: any, value: number | number[]) => {
      item.setGrindPercent(value as number);
      setLocalGrind(value as number);
    },
    [item]
  );

  const onSliderChangeCommitted = React.useCallback(
    (_: any, value: number | number[]) => {
      item.setGrindPercent(value as number);
      setLocalGrind(null);
    },
    [item]
  );

  // We change the ingredientId during mouse over for live feedback, but this changes the ingredient id we wish to display.
  // We need to pin the previously selected id so that IngredientSelector works properly during the selection process.
  const displayIngredientId = isPreviewing
    ? savedIngredientRef.current
    : ingredientId;
  return (
    <div>
      <div>
        <Typography variant="overline">Ingredient</Typography>
      </div>
      <IngredientSelector
        fullWidth
        value={displayIngredientId}
        allowEmpty={displayIngredientId == null}
        // Store the last ingredient when we open, so we can return to it after closing without making a selection.
        onOpen={onIngredientSelectorOpen}
        // Change the ingredient id with the mouse for a live preview.
        onMouseOverItem={onIngredientSelectorMouseOverItem}
        // Change our saved ingredient when the input is committed.  We will restore it when the input closes after the change.
        onChange={onIngredientSelectorChange}
        onClose={onIngredientSelectorClose}
      />
      <Grid paddingTop={1}>
        <TextField
          label="Grind Percent"
          value={inputGrindPercent ?? grindPercent * 100}
          onChange={onGrindPercentTextChange}
          onBlur={onGrindPercentBlur}
        />
        <Slider
          value={localGrind ?? grindPercent}
          onChange={onSliderChange}
          onChangeCommitted={onSliderChangeCommitted}
          min={0}
          max={1}
          step={0.001}
        />
      </Grid>
    </div>
  );
};

export default AddIngredientPlotListItem;
