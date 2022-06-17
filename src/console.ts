import container from "./container";
import { IngredientRegistry } from "./services/ingredients/IngredientRegistry";
import { Plotter } from "./services/plotter/Plotter";
import { PotionBaseRegistry } from "./services/potion-bases/PotionBaseRegistry";

const w = window as any;

w.enableTk = () => {
  w.tk = {
    vector2: require("./vector2"),
    curves: require("./curves"),
    pointArray: require("./point-array"),
    ingredients: container.get(IngredientRegistry),
    plotter: container.get(Plotter),
    potionBases: container.get(PotionBaseRegistry),
    PotionMap: require("./services/potion-maps/PotionMap"),
  };
};
