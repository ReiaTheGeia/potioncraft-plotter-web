import * as React from "react";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { ingredientId } from "@/services/ingredients/types";
import { ingredients } from "@/services/ingredients/ingredients";
import { PlotBuilder } from "@/services/plotter/PlotBuilder";

import Plot from "./Plot";

const App: React.FC = () => {
  const builder = useDICreate(PlotBuilder);
  React.useEffect(() => {
    for (const ingredient of ingredients) {
      builder.addItem({
        type: "add-ingredient",
        ingredientId: ingredient.id,
        grindPercent: 1,
      });
    }
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
