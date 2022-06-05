import * as React from "react";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { IngredientId } from "@/services/ingredients/types";
import { PlotBuilder } from "@/services/plotter/PlotBuilder";

import Plot from "./Plot";

const App: React.FC = () => {
  const builder = useDICreate(PlotBuilder);
  React.useEffect(() => {
    builder.addItem({
      type: "add-ingredient",
      ingredientId: "Windbloom" as IngredientId,
      grindPercent: 1,
    });

    builder.addItem({
      type: "stir-cauldron",
      distance: 5,
    });
    // builder.addItem({
    //   type: "pour-solvent",
    //   distance: 2,
    // });
  }, [builder]);
  const plot = useObservation(builder.plot$);
  return (
    <div>
      {!plot && <span>No plot</span>}
      {plot && <Plot plot={plot} />}
    </div>
  );
};

export default App;
