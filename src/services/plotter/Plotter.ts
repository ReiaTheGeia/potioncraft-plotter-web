import { last } from "lodash";
import { inject, injectable, singleton } from "microinject";

import { curveToPoints } from "@/curves";
import {
  PointArray,
  pointArrayLength,
  pointArrayLineFromDistance,
  takePointArrayByDistance,
} from "@/point-array";
import {
  Point,
  pointAdd,
  pointDistance,
  pointEquals,
  pointNormalize,
  pointSubtract,
  PointZero,
} from "@/points";

import { IngredientRegistry } from "../ingredients/IngredientRegistry";

import {
  AddIngredientPlotItem,
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

  plotItems(items: readonly PlotItem[]): PlotResult {
    console.log("Plotting", items);
    let result: PlotResult = {
      committedPoints: [],
      pendingPoints: [],
    };

    for (const item of items) {
      console.log("Plotting item", item);
      result = this._plotItem(item, result);
    }

    return result;
  }

  private _plotItem(item: PlotItem, result: PlotResult): PlotResult {
    switch (item.type) {
      case "add-ingredient":
        return this._plotAddIngredient(item, result);
      case "pour-solvent":
        return this._plotPourSolvent(item, result);
      case "stir-cauldron":
        return this._plotStirCauldron(item, result);
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
      last(result.pendingPoints) ?? last(result.committedPoints) ?? PointZero;

    const ingredient = this.ingredientRegistry.getIngredient(ingredientId);
    if (!ingredient) {
      throw new Error(`Unknown ingredient: ${ingredientId}`);
    }

    const ingredientPoints: PointArray = [];
    for (const curve of ingredient.path) {
      const points = curveToPoints(curve);
      ingredientPoints.push(...points);
    }

    const ingredientLength = pointArrayLength(ingredientPoints);
    const takePercent =
      ingredient.preGrindPercent +
      grindPercent * (1 - ingredient.preGrindPercent);

    const [addedPoints] = takePointArrayByDistance(
      ingredientPoints,
      takePercent * ingredientLength
    );

    const appendPendingPoints = addedPoints.map((point) =>
      pointAdd(addPosition, point)
    );

    return appendPendingPlotPoints(appendPendingPoints, item, result);
  }

  private _plotPourSolvent(
    item: PourSolventPlotItem,
    result: PlotResult
  ): PlotResult {
    const currentPoint =
      result.committedPoints[result.committedPoints.length - 1] ?? PointZero;
    if (pointEquals(currentPoint, PointZero)) {
      return result;
    }

    let { distance } = item;

    const distanceToOrigin = pointDistance(currentPoint, PointZero);
    if (distance > distanceToOrigin) {
      distance = distanceToOrigin;
    }

    const newPoints = pointArrayLineFromDistance(
      currentPoint,
      pointNormalize(pointSubtract(PointZero, currentPoint)),
      distance
    );

    console.log("Solvent adding new points", newPoints);

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

    const addedPlotPoints = addedPoints.map((p) => ({
      x: p.x,
      y: p.y,
      source: item,
    }));

    return {
      committedPoints: result.committedPoints.concat(addedPlotPoints),
      pendingPoints: remainderPlotPoints,
    };
  }
}

function appendPendingPlotPoints(
  points: Point[],
  source: PlotItem,
  result: PlotResult
): PlotResult {
  return Object.assign({}, result, {
    pendingPoints: result.pendingPoints.concat(
      points.map((point) => ({
        x: point.x,
        y: point.y,
        source,
      }))
    ),
  });
}

function commitPlotPoints(
  points: Point[],
  source: PlotItem,
  result: PlotResult
): PlotResult {
  if (points.length === 0) {
    return result;
  }

  const difference = pointSubtract(
    last(points)!,
    last(result.committedPoints) ?? PointZero
  );

  return Object.assign({}, result, {
    committedPoints: result.committedPoints.concat(
      points.map((point) => ({
        x: point.x,
        y: point.y,
        source,
      }))
    ),
    pendingPoints: result.pendingPoints.map((point) =>
      pointAdd(point, difference)
    ),
  });
}
