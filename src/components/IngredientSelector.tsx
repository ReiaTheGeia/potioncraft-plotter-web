import React from "react";

import {
  MenuItem,
  Select,
  SelectProps,
  SelectChangeEvent,
  ListItemText,
  Tooltip,
  styled,
} from "@mui/material";

import { useDIDependency } from "@/container";

import {
  IngredientDescriptor,
  IngredientId,
} from "@/services/ingredients/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import { POTION_RADIUS } from "@/game-settings";

export interface IngredientSelectorProps
  extends Omit<SelectProps<IngredientId | "">, "value" | "onChange"> {
  value: IngredientId | null;
  allowEmpty?: boolean;
  onChange(value: IngredientId | null): void;
}

const StyledTooltip = styled(Tooltip)({
  tooltipPlacementLeft: {
    margin: "10px 0",
  },
});

const IngredientSelector = ({
  value,
  onChange,
  allowEmpty = false,
  ...props
}: IngredientSelectorProps) => {
  const registry = useDIDependency(IngredientRegistry);

  const onSelectChange = React.useCallback(
    (e: SelectChangeEvent<IngredientId | "">) => {
      const value = e.target.value;
      console.log("onSelectChange", value);
      if (value === "") {
        onChange(null);
      } else {
        onChange(value as any);
      }
    },
    [onChange]
  );

  return (
    <Select<IngredientId | "">
      {...props}
      value={value ?? ""}
      onChange={onSelectChange}
    >
      {allowEmpty && <MenuItem value=""></MenuItem>}
      {registry.getIngredients().map((ingredient) => (
        <MenuItem key={ingredient.id} value={ingredient.id}>
          <StyledTooltip
            placement="left"
            title={
              <svg
                width="100px"
                height="100px"
                viewBox="-7 -7 14 14"
                transform="scale(1, -1)"
              >
                <circle cx={0} cy={0} r={POTION_RADIUS} fill="blue" />
                <path
                  d={ingredient.path.reduce(
                    (path, curve) =>
                      path +
                      `M ${curve.start.x} ${curve.start.y} C ${curve.p1.x},${curve.p1.y} ${curve.p2.x},${curve.p2.y} ${curve.end.x},${curve.end.y}`,
                    "M 0 0 "
                  )}
                  stroke="black"
                  strokeWidth={0.2}
                  fill="none"
                />
              </svg>
            }
          >
            <ListItemText>{ingredient.name}</ListItemText>
          </StyledTooltip>
        </MenuItem>
      ))}
    </Select>
  );
};

export default IngredientSelector;
