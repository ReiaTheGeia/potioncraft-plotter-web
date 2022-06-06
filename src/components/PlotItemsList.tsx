import React from "react";

import {
  styled,
  Card,
  CardContent,
  Typography,
  Slider,
  Grid,
  Fab,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { useObservation } from "@/hooks/observe";

import {
  AddIngredientPlotBuilderItem,
  PlotBuilder,
  PlotBuilderItem,
} from "@/services/plotter/PlotBuilder";

import IngredientSelector from "./IngredientSelector";
import { IngredientId } from "@/services/ingredients/types";

export interface PlotItemsListProps {
  className?: string;
  builder: PlotBuilder;
}

const Root = styled("div")(({ theme }) => ({
  overflow: "auto",
  boxSixing: "border-box",
  display: "flex",
  flexDirection: "column",
  "& .list": {
    listStyle: "none",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  "& .list-item": {
    marginBottom: theme.spacing(1),
  },
  "& .add-item": {
    alignSelf: "center",
  },
}));

const PlotItemsList = ({ className, builder }: PlotItemsListProps) => {
  const items = useObservation(builder.items$) ?? [];
  return (
    <Root className={className}>
      <ul className="list">
        {items.map((item, i) => (
          <PlotListItem key={i} item={item} />
        ))}
      </ul>
      <Fab className="add-item" onClick={() => builder.addIngredient()}>
        <AddIcon />
      </Fab>
    </Root>
  );
};

interface PlotListItemProps {
  item: PlotBuilderItem;
}
const PlotListItem = ({ item }: PlotListItemProps) => {
  if (item instanceof AddIngredientPlotBuilderItem) {
    return <AddIngredientPlotListItem item={item} />;
  }

  return <div>Unknown PlotItem {item.constructor.name}</div>;
};

interface AddIngredientPlotListItemProps {
  item: AddIngredientPlotBuilderItem;
}
const AddIngredientPlotListItem = ({
  item,
}: AddIngredientPlotListItemProps) => {
  const valid = useObservation(item.isValid$) ?? false;
  const ingredientId = useObservation(item.ingredientId$) ?? null;
  const grindPercent = useObservation(item.grindPercent$) ?? 0;
  return (
    <Card
      className="list-item"
      style={{ backgroundColor: valid ? undefined : "salmon" }}
    >
      <CardContent>
        <div>
          <Typography variant="overline">Ingredient</Typography>
        </div>
        <IngredientSelector
          fullWidth
          value={ingredientId ?? ""}
          allowEmpty={ingredientId == null}
          onChange={(id) => item.setIngredient(id as IngredientId)}
        />
        <Grid paddingTop={1}>
          <Typography id="grind-label">Grind Percent</Typography>
          <Slider
            value={grindPercent}
            onChange={(_, value) => item.setGrindPercent(value as number)}
            aria-labelledby="grind-label"
            min={0}
            max={1}
            step={0.001}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PlotItemsList;
