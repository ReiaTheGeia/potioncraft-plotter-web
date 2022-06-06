import React from "react";

import {
  MenuItem,
  Select,
  SelectProps,
  SelectChangeEvent,
} from "@mui/material";
import { IngredientId } from "@/services/ingredients/types";
import { useDIDependency } from "@/container";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";

export interface IngredientSelectorProps
  extends Omit<SelectProps<IngredientId | "">, "value" | "onChange"> {
  value: IngredientId | "";
  allowEmpty?: boolean;
  onChange(value: IngredientId | ""): void;
}

const IngredientSelector = ({
  value,
  onChange,
  allowEmpty = false,
  ...props
}: IngredientSelectorProps) => {
  const registry = useDIDependency(IngredientRegistry);
  const onSelectChange = React.useCallback(
    (e: SelectChangeEvent<IngredientId | "">) => {
      onChange(e.target.value as IngredientId);
    },
    [onChange]
  );
  return (
    <Select<IngredientId | "">
      {...props}
      value={value}
      onChange={onSelectChange}
    >
      {allowEmpty && <MenuItem value=""></MenuItem>}
      {registry.getIngredients().map((ingredient) => (
        <MenuItem value={ingredient.id}>{ingredient.id}</MenuItem>
      ))}
    </Select>
  );
};

export default IngredientSelector;
