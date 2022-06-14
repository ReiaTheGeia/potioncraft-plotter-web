import { last } from "lodash";
import { inject, injectable, singleton } from "microinject";

import { POTION_RADIUS } from "@/game-settings";
import { degreesToRadians } from "@/utils";
import { curveToPoints } from "@/curves";
import {
  PointArray,
  pointArrayLengthCached,
  pointArrayLineFromDistance,
  takePointArrayByDistance,
} from "@/point-array";
import {
  Vector2,
  vec2Add,
  vec2Distance,
  vec2Equals,
  vec2Magnitude,
  vec2MoveTowards,
  vec2Normalize,
  vec2Rotate,
  vec2Scale,
  pointSignedAngleDegrees180,
  vec2Subtract,
  Vec2Zero,
} from "@/vector2";

import { IngredientRegistry } from "../ingredients/IngredientRegistry";
import { PotionMap } from "../potion-maps/PotionMap";

import {
  AddIngredientPlotItem,
  HeatVortexPlotItem,
  PlotItem,
  PlotResult,
  PourSolventPlotItem,
  StirCauldronPlotItem,
} from "./types";

@injectable()
@singleton()
export class Plotter {
  constructor(
    @inject(IngredientRegistry) private ingredientRegistry: IngredientRegistry
  ) {}

  plotItems(items: readonly PlotItem[], map: PotionMap): PlotResult {
    let result: PlotResult = {
      committedPoints: [],
      pendingPoints: [],
    };

    // return result;

    const now = Date.now();

    for (const item of items) {
      result = this._plotItem(item, result, map);
    }

    for (const point of result.committedPoints.concat(result.pendingPoints)) {
      const entities = map.hitTest(point, POTION_RADIUS);
      point.entities = entities as any;
    }

    console.log("plotting took", Date.now() - now);

    return result;
  }

  private _plotItem(
    item: PlotItem,
    result: PlotResult,
    map: PotionMap
  ): PlotResult {
    switch (item.type) {
      case "add-ingredient":
        return this._plotAddIngredient(item, result);
      case "pour-solvent":
        return this._plotPourSolvent(item, result);
      case "stir-cauldron":
        return this._plotStirCauldron(item, result);
      case "heat-vortex":
        return this._plotHeatVortex(item, result, map);
      default:
        throw new Error(`Unknown plot item type: ${(item as any).type}`);
    }
  }

  private _plotAddIngredient(
    item: AddIngredientPlotItem,
    result: PlotResult
  ): PlotResult {
    const { ingredientId, grindPercent } = item;

    const addPosition =
      last(result.pendingPoints) ?? last(result.committedPoints) ?? Vec2Zero;

    const ingredient = this.ingredientRegistry.getIngredientById(ingredientId);
    if (!ingredient) {
      throw new Error(`Unknown ingredient: ${ingredientId}`);
    }

    const ingredientPoints: PointArray = [];
    let ingredientLength = 0;
    for (const curve of ingredient.path) {
      const points = curveToPoints(curve);
      ingredientPoints.push(...points);
      // Use the cached length, as curveToPoints is cached and will return consistent array references.
      // Note, this produces a very slightly incorrect length. A difference of around e-15 when compared to getting
      // the length of the final ingredientPoints array.
      ingredientLength += pointArrayLengthCached(points);
    }

    const takePercent =
      ingredient.preGrindPercent +
      grindPercent * (1 - ingredient.preGrindPercent);

    const [addedPoints] = takePointArrayByDistance(
      ingredientPoints,
      takePercent * ingredientLength
    );

    const appendPendingPoints = addedPoints.map((point) =>
      vec2Add(addPosition, point)
    );

    return appendPendingPlotPoints(appendPendingPoints, item, result);
  }

  private _plotPourSolvent(
    item: PourSolventPlotItem,
    result: PlotResult
  ): PlotResult {
    const currentPoint =
      result.committedPoints[result.committedPoints.length - 1] ?? Vec2Zero;
    if (vec2Equals(currentPoint, Vec2Zero)) {
      return result;
    }

    let { distance } = item;

    const distanceToOrigin = vec2Distance(currentPoint, Vec2Zero);
    if (distance > distanceToOrigin) {
      distance = distanceToOrigin;
    }

    const newPoints = pointArrayLineFromDistance(
      currentPoint,
      vec2Normalize(vec2Subtract(Vec2Zero, currentPoint)),
      distance
    );

    return commitPlotPoints(newPoints, item, result);
  }

  private _plotStirCauldron(
    item: StirCauldronPlotItem,
    result: PlotResult
  ): PlotResult {
    const { distance } = item;

    const [addedPoints, remainderPlotPoints] = takePointArrayByDistance(
      result.pendingPoints,
      distance
    );

    return {
      committedPoints: result.committedPoints.concat(addedPoints),
      pendingPoints: remainderPlotPoints,
    };
  }

  private _plotHeatVortex(
    item: HeatVortexPlotItem,
    result: PlotResult,
    map: PotionMap
  ): PlotResult {
    const indicatorPosition = last(result.committedPoints) ?? Vec2Zero;
    const vortex = map
      .hitTest(indicatorPosition, POTION_RADIUS)
      .find((x) => x.entityType === "Vortex");

    if (!vortex) {
      return result;
    }

    const { distance } = item;

    /* RecipeMapManager.MoveIndicatorTowardsVortex()
    float maxDistanceDelta = this.vortexSettings.vortexMovementFromHeatDependence.Evaluate(Managers.Ingredient.coals.Heat) * this.vortexSettings.vortexMovementSpeed * Time.deltaTime;
    Vector2 localPosition1 = (Vector2) this.currentVortexMapItem.thisTransform.localPosition;
    Vector2 localPosition2 = (Vector2) this.recipeMapObject.indicatorContainer.localPosition;
    Vector2 to = localPosition2 - localPosition1;
    float magnitude = to.magnitude;
    float f1 = Mathf.Sign(this.vortexSettings.vortexSpiralThetaPower) * this.vortexSettings.vortexSpiralStep;
    float f2 = Mathf.Pow((float) ((double) magnitude * 2.0 * 3.14159274101257) / f1, 1f / this.vortexSettings.vortexSpiralThetaPower);
    float b = f2 - maxDistanceDelta * (float) ((int) Mathf.Sign(this.vortexSettings.vortexSpiralThetaPower) * (int) Mathf.Sign(f1));
    float f3 = f2.Is(0.0f) ? 0.0f : ((double) f2 < 0.0 ? Mathf.Min(0.0f, b) : Mathf.Max(0.0f, b));
    double num = (double) f1 * 0.5 / 3.14159274101257 * (double) Mathf.Pow(f3, this.vortexSettings.vortexSpiralThetaPower);
    Vector2 from = magnitude * new Vector2(Mathf.Cos(f2), Mathf.Sin(f2));
    Vector2 vector2_1 = new Vector2(Mathf.Cos(f3), Mathf.Sin(f3));
    Vector2 vector2_2 = ((float) num * vector2_1).Rotate(Vector2.SignedAngle(from, to));
    Vector2 vector2_3 = Vector2.MoveTowards(localPosition2, localPosition1 + vector2_2, maxDistanceDelta);
    this.indicator.targetPosition += vector2_3 - localPosition2;
    this.recipeMapObject.indicatorContainer.localPosition = (Vector3) vector2_3;
    */

    // VortexSettings
    const vortexMovementFromHeatDependence10Percent = 0.19;
    const vortexMovementSpeed = 2.5;
    const vortexSpiralStep = 1;
    const vortexSpiralThetaPower = 1;

    // Calculate the step as if we were running at 10% heat at 60 frames a second.
    const step =
      vortexMovementFromHeatDependence10Percent *
      vortexMovementSpeed *
      (1 / 60);

    let remainingDistance = distance;
    let currentPosition = indicatorPosition;
    const pointsToAdd: Vector2[] = [indicatorPosition];
    while (remainingDistance > 0) {
      const to = vec2Subtract(currentPosition, vortex);
      const magnitude = vec2Magnitude(to);
      const f1 = Math.sign(vortexSpiralThetaPower) * vortexSpiralStep;
      const f2 = Math.pow(
        (magnitude * 2.0 * Math.PI) / f1,
        1 / vortexSpiralThetaPower
      );
      const b = f2 - step * (Math.sign(vortexSpiralThetaPower) * Math.sign(f1));
      const f3 =
        Math.abs(f2) < Number.EPSILON
          ? 0
          : f2 < 0.0
          ? Math.min(0.0, b)
          : Math.max(0.0, b);
      const num = ((f1 * 0.5) / Math.PI) * Math.pow(f3, vortexSpiralThetaPower);
      const from = vec2Scale({ x: Math.cos(f2), y: Math.sin(f2) }, magnitude);
      const vector2_1 = { x: Math.cos(f3), y: Math.sin(f3) };

      const rotation = degreesToRadians(pointSignedAngleDegrees180(from, to));
      const vector2_2 = vec2Rotate(vec2Scale(vector2_1, num), rotation);
      const vector2_3 = vec2MoveTowards(
        currentPosition,
        vec2Add(vortex, vector2_2),
        step
      );

      currentPosition = vector2_3;
      pointsToAdd.push(currentPosition);

      remainingDistance = Math.max(0, remainingDistance - step);
    }

    return commitPlotPoints(pointsToAdd, item, result);
  }
}

function appendPendingPlotPoints(
  points: Vector2[],
  source: PlotItem,
  result: PlotResult
): PlotResult {
  if (source == null) {
    throw new Error("source is null");
  }

  if (points.length === 0) {
    return result;
  }

  return Object.assign({}, result, {
    pendingPoints: result.pendingPoints.concat(
      points.map((point) => ({
        x: point.x,
        y: point.y,
        source,
        entities: [],
      }))
    ),
  });
}

function commitPlotPoints(
  points: Vector2[],
  source: PlotItem,
  result: PlotResult
): PlotResult {
  if (source == null) {
    throw new Error("source is null");
  }

  if (points.length === 0) {
    return result;
  }

  const difference = vec2Subtract(
    last(points)!,
    last(result.committedPoints) ?? Vec2Zero
  );

  return Object.assign({}, result, {
    committedPoints: result.committedPoints.concat(
      points.map((point) => ({
        x: point.x,
        y: point.y,
        source,
        entities: [],
      }))
    ),
    pendingPoints: result.pendingPoints.map((point) => ({
      x: point.x + difference.x,
      y: point.y + difference.y,
      source: point.source,
    })),
  });
}
