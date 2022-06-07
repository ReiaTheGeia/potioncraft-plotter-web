import React from "react";

import {
  styled,
  Card,
  CardContent,
  Typography,
  Slider,
  Grid,
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

import { useObservation } from "@/hooks/observe";

import {
  AddIngredientPlotBuilderItem,
  PlotBuilder,
  PlotBuilderItem,
  PourSolventPlotBuilderItem,
  StirCauldronPlotBuilderItem,
} from "@/services/plotter/PlotBuilder";
import { IngredientId } from "@/services/ingredients/types";

import IngredientSelector from "./IngredientSelector";

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
    position: "relative",
    marginBottom: theme.spacing(1),
  },
  "& .list-item .delete-button": {
    position: "absolute",
    top: "5px",
    right: "15px",
  },
  "& .buttons": {
    alignSelf: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
      <div className="buttons">
        <Button color="primary" onClick={() => builder.addIngredient()}>
          <AddIcon /> Ingredient
        </Button>
        <Button color="primary" onClick={() => builder.addStirCauldron()}>
          <AddIcon /> Stir Cauldron
        </Button>
        <Button color="primary" onClick={() => builder.addPourSolvent()}>
          <AddIcon /> Pour Solvent
        </Button>
      </div>
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
  if (item instanceof StirCauldronPlotBuilderItem) {
    return <StirCauldronPlotListItem item={item} />;
  }
  if (item instanceof PourSolventPlotBuilderItem) {
    return <PourSolventPlotListItem item={item} />;
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
      <IconButton
        size="small"
        className="delete-button"
        onClick={() => item.delete()}
      >
        <DeleteIcon />
      </IconButton>
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

interface StirCauldronPlotListItemProps {
  item: StirCauldronPlotBuilderItem;
}

const StirCauldronPlotListItem = ({ item }: StirCauldronPlotListItemProps) => {
  const valid = useObservation(item.isValid$) ?? false;
  const [duration, setDuration] = React.useState("");
  const onTextFieldChanged = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }
      item.setDistance(asNumber);
      setDuration(e.target.value);
    },
    [item]
  );
  return (
    <Card
      className="list-item"
      style={{ backgroundColor: valid ? undefined : "salmon" }}
    >
      <IconButton
        size="small"
        className="delete-button"
        onClick={() => item.delete()}
      >
        <DeleteIcon />
      </IconButton>
      <CardContent>
        <div>
          <Typography variant="overline">Stir Cauldron</Typography>
        </div>
        <TextField
          label="Distance"
          value={duration}
          onChange={onTextFieldChanged}
        />
      </CardContent>
    </Card>
  );
};

interface PourSolventPlotListItemProps {
  item: PourSolventPlotBuilderItem;
}
const PourSolventPlotListItem = ({ item }: PourSolventPlotListItemProps) => {
  const valid = useObservation(item.isValid$) ?? false;
  const [duration, setDuration] = React.useState("");
  const onTextFieldChanged = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }
      item.setDistance(asNumber);
      setDuration(e.target.value);
    },
    [item]
  );
  return (
    <Card
      className="list-item"
      style={{ backgroundColor: valid ? undefined : "salmon" }}
    >
      <IconButton
        size="small"
        className="delete-button"
        onClick={() => item.delete()}
      >
        <DeleteIcon />
      </IconButton>
      <CardContent>
        <div>
          <Typography variant="overline">Pour Solvent</Typography>
        </div>
        <TextField
          label="Distance"
          value={duration}
          onChange={onTextFieldChanged}
        />
      </CardContent>
    </Card>
  );
};

export default PlotItemsList;
