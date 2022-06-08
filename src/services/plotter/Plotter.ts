import { last } from "lodash";
import { inject, injectable, singleton } from "microinject";

import { curveToPoints } from "@/curves";
import {
  PointArray,
  pointArrayLengthCached,
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
    let result: PlotResult = {
      committedPoints: [],
      pendingPoints: [],
    };

    for (const item of items) {
      result = this._plotItem(item, result);
      if (result.committedPoints.some((x) => x.source == null)) {
        console.error("Plot item committed has no source after", item);
      }
      if (result.pendingPoints.some((x) => x.source == null)) {
        console.error("Plot item pending has no source after", item);
      }
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

    console.log("Pour solvent new points", newPoints);

    result = commitPlotPoints(newPoints, item, result);
    console.log("Pour solvent result", result);
    return result;
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
}

function appendPendingPlotPoints(
  points: Point[],
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
      }))
    ),
  });
}

function commitPlotPoints(
  points: Point[],
  source: PlotItem,
  result: PlotResult
): PlotResult {
  if (source == null) {
    throw new Error("source is null");
  }

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
    pendingPoints: result.pendingPoints.map((point) => ({
      x: point.x + difference.x,
      y: point.y + difference.y,
      source: point.source,
    })),
  });
}
