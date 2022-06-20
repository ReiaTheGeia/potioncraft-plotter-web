import React from "react";
import { uniq, sum, last } from "lodash";

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  styled,
  IconButtonProps,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

import { useDIDependency } from "@/container";
import { pointArrayLength } from "@/point-array";
import { vec2Magnitude, vec2Subtract, Vec2Zero } from "@/vector2";
import {
  DANGER_LENGTH_LETHAL,
  DANGER_HEALTH_DECREASE_PER_UNIT,
  LIFE_HEALTH_PER_GRAIN,
} from "@/game-settings";

import {
  AddIngredientPlotItem,
  AddVoidSaltPlotItem,
  isIngredientPlotItem,
  isVoidSaltPlotItem,
  PlotItem,
  PlotPoint,
  PlotResult,
} from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import { MapEntity, PotionEffectMapEntity } from "@/services/potion-maps/types";
import {
  getEffectTier,
  calculateDangerLengths,
} from "@/services/plotter/utils";

import FixedValue from "../FixedValue";
import ExpandButton from "../ExpandButton";

export interface PlotDetailsProps {
  className?: string;
  items: readonly PlotItem[];
  plot: PlotResult;
}

const PlotDetails = ({ className, items, plot }: PlotDetailsProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);
  const [ingredientsExpanded, setIngredientsExpanded] = React.useState(false);

  const endsAt = last(plot.committedPoints) ?? Vec2Zero;

  const [
    effects,
    baseCost,
    length,
    ingredientMap,
    totalIngredients,
    totalUniqueIngredients,
    stress,
    longestDanger,
    lifeSaltRequired,
  ] = React.useMemo(() => {
    const ingredients = items.filter(isIngredientPlotItem);

    const effects = getEffects(plot.committedPoints);

    let baseCost = 0;
    let ingredientTypeCounts: Record<string, number> = {};
    for (const { ingredientId } of ingredients) {
      const ingredient = ingredientRegistry.getIngredientById(ingredientId);
      if (!ingredient) {
        continue;
      }
      baseCost += ingredient.price;
      ingredientTypeCounts[ingredient.id] =
        (ingredientTypeCounts[ingredient.id] ?? 0) + 1;
    }

    const length = pointArrayLength(plot.committedPoints);

    const ingredientMap: Record<string, number> = {};
    for (const { ingredientId } of ingredients) {
      const name = ingredientRegistry.getIngredientById(ingredientId)?.name;
      if (!name) {
        continue;
      }
      ingredientMap[name] = (ingredientMap[name] ?? 0) + 1;
    }
    const voidSaltCount = sum(
      items.filter(isVoidSaltPlotItem).map((x) => x.grains)
    );
    if (voidSaltCount > 0) {
      ingredientMap["Void Salt"] = voidSaltCount;
    }
    const totalIngredients = ingredients.length;
    const totalUniqueIngredients = uniq(
      ingredients.map((x) => x.ingredientId)
    ).length;

    const stress = Math.sqrt(
      sum(
        Object.keys(ingredientTypeCounts).map((key) =>
          Math.pow(ingredientTypeCounts[key], 2)
        )
      )
    );

    const dangerLengths = calculateDangerLengths(
      plot.committedPoints,
      ingredientRegistry
    );
    const longestDanger = Math.max(...dangerLengths, 0);
    const lifeSaltRequiredLengths = dangerLengths
      .map((x) => x - DANGER_LENGTH_LETHAL)
      .filter((x) => x > 0);
    const lifeSaltRequiredHealth = sum(
      lifeSaltRequiredLengths.map((x) => x * -DANGER_HEALTH_DECREASE_PER_UNIT)
    );
    const lifeSaltRequired = Math.ceil(
      lifeSaltRequiredHealth / LIFE_HEALTH_PER_GRAIN
    );

    return [
      effects,
      baseCost,
      length,
      ingredientMap,
      totalIngredients,
      totalUniqueIngredients,
      stress,
      longestDanger,
      lifeSaltRequired,
    ];
  }, [items, plot, IngredientRegistry]);

  // PotionCraft subtract .4 health each unit of distance against a max of 1.
  const dangerIsDeath = longestDanger >= DANGER_LENGTH_LETHAL;

  return (
    <Card className={className} variant="outlined">
      <CardContent>
        <Typography variant="h6">Details</Typography>
        <table>
          <tbody>
            {Object.keys(effects).length > 0 && (
              <tr>
                <td>
                  <Typography>Effects on Path:</Typography>
                </td>
                <td>
                  <Typography variant="overline">
                    {Object.keys(effects)
                      .map((effect) => `${effect} (${effects[effect]})`)
                      .join(", ")}
                  </Typography>
                </td>
              </tr>
            )}
            <tr>
              <td>
                <Typography>Ingredient count:</Typography>
              </td>
              <td>
                <Typography variant="overline" component="span">
                  {totalIngredients} ({totalUniqueIngredients} unique)
                </Typography>
                <ExpandButton
                  expanded={ingredientsExpanded}
                  onExpanded={setIngredientsExpanded}
                />
              </td>
            </tr>
            {ingredientsExpanded &&
              Object.keys(ingredientMap).map((ingredient) => (
                <tr>
                  <td style={{ paddingLeft: "8px" }}>{ingredient}</td>
                  <td>
                    <Typography variant="overline">
                      {ingredientMap[ingredient]}
                    </Typography>
                  </td>
                </tr>
              ))}
            <tr>
              <td>
                <Typography>Ingredient stress:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  <FixedValue value={stress} />
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Cost:</Typography>
              </td>
              <td>
                <Typography variant="overline">{baseCost}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Committed length:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  <FixedValue value={length} />
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Ends at:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  <FixedValue value={endsAt.x} />,{" "}
                  <FixedValue value={endsAt.y} />
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Longest length in bones:</Typography>
              </td>
              <td>
                <Typography
                  variant="overline"
                  color={dangerIsDeath ? "error" : "textPrimary"}
                >
                  <FixedValue value={longestDanger} /> / {DANGER_LENGTH_LETHAL}
                </Typography>
              </td>
            </tr>
            {lifeSaltRequired > 0 && (
              <tr>
                <td>
                  <Typography>Life salt required:</Typography>
                </td>
                <td>
                  <Typography variant="overline">{lifeSaltRequired}</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default PlotDetails;

function getEffects(items: PlotPoint[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const effect = item.bottleCollisions.find(itemIsEffect);
    if (!effect) {
      continue;
    }

    const distance = vec2Magnitude(vec2Subtract(item, effect));
    const tier = getEffectTier(distance, 0);
    result[effect.effect] = Math.max(result[effect.effect] ?? 0, tier);
  }

  return result;
}

function itemIsEffect(item: MapEntity): item is PotionEffectMapEntity {
  return item.entityType === "PotionEffect";
}
