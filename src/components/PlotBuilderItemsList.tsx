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

export interface PlotBuilderItemsListProps {
  className?: string;
  builder: PlotBuilder;
  highlightItem?: PlotBuilderItem | null;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
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

const PlotBuilderItemsList = ({
  className,
  builder,
  highlightItem,
  onMouseOver,
  onMouseOut,
}: PlotBuilderItemsListProps) => {
  const items = useObservation(builder.items$) ?? [];
  return (
    <Root className={className}>
      <ul className="list">
        {items.map((item, i) => (
          <PlotListItem
            key={i}
            item={item}
            highlight={item === highlightItem}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
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
  highlight?: boolean;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const PlotListItem = ({
  item,
  highlight = false,
  onMouseOver,
  onMouseOut,
}: PlotListItemProps) => {
  let content: React.ReactNode = (
    <div>Unknown PlotItem {item.constructor.name}</div>
  );
  if (item instanceof AddIngredientPlotBuilderItem) {
    content = <AddIngredientPlotListItem item={item} />;
  } else if (item instanceof StirCauldronPlotBuilderItem) {
    content = <StirCauldronPlotListItem item={item} />;
  } else if (item instanceof PourSolventPlotBuilderItem) {
    content = <PourSolventPlotListItem item={item} />;
  }

  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {content}
    </PlotListItemCard>
  );
};

interface PlotListItemCardProps {
  item: PlotBuilderItem;
  highlight: boolean;
  children: React.ReactNode;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}

const PlotListItemCard = ({
  item,
  highlight,
  children,
  onMouseOver,
  onMouseOut,
}: PlotListItemCardProps) => {
  const valid = useObservation(item.isValid$) ?? false;
  return (
    <Card
      className="list-item"
      style={{
        backgroundColor:
          (!valid && "salmon") || (highlight && "lightblue") || undefined,
      }}
      onMouseOver={() => onMouseOver(item)}
      onMouseOut={onMouseOut}
    >
      <IconButton
        size="small"
        className="delete-button"
        onClick={() => item.delete()}
      >
        <DeleteIcon />
      </IconButton>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

interface AddIngredientPlotListItemProps {
  item: AddIngredientPlotBuilderItem;
}
const AddIngredientPlotListItem = ({
  item,
}: AddIngredientPlotListItemProps) => {
  const ingredientId = useObservation(item.ingredientId$) ?? null;
  const grindPercent = useObservation(item.grindPercent$) ?? 0;
  return (
    <div>
      <div>
        <Typography variant="overline">Ingredient</Typography>
      </div>
      <IngredientSelector
        fullWidth
        value={ingredientId}
        allowEmpty={ingredientId == null}
        onChange={(id) => item.setIngredient(id)}
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
    </div>
  );
};

interface StirCauldronPlotListItemProps {
  item: StirCauldronPlotBuilderItem;
}

const StirCauldronPlotListItem = ({ item }: StirCauldronPlotListItemProps) => {
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
    <div>
      <div>
        <Typography variant="overline">Stir Cauldron</Typography>
      </div>
      <TextField
        label="Distance"
        value={duration}
        onChange={onTextFieldChanged}
      />
    </div>
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
    <div>
      <div>
        <Typography variant="overline">Pour Solvent</Typography>
      </div>
      <TextField
        label="Distance"
        value={duration}
        onChange={onTextFieldChanged}
      />
    </div>
  );
};

export default PlotBuilderItemsList;
