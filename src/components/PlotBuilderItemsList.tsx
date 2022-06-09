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
  if (item instanceof AddIngredientPlotBuilderItem) {
    return (
      <AddIngredientPlotListItem
        item={item}
        highlight={highlight}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      />
    );
  } else if (item instanceof StirCauldronPlotBuilderItem) {
    return (
      <StirCauldronPlotListItem
        item={item}
        highlight={highlight}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      />
    );
  } else if (item instanceof PourSolventPlotBuilderItem) {
    return (
      <PourSolventPlotListItem
        item={item}
        highlight={highlight}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      />
    );
  }
  return <div>Unknown PlotItem {item.constructor.name}</div>;
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
  highlight: boolean;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const AddIngredientPlotListItem = ({
  item,
  highlight,
  onMouseOver,
  onMouseOut,
}: AddIngredientPlotListItemProps) => {
  const savedIngredientRef = React.useRef<IngredientId | null>(null);

  // Need both state (for rerender on change) and ref (to check it in a callback)
  const [isPreviewing, setIsPreviewing] = React.useState<boolean>(false);
  const isPreviewingRef = React.useRef(false);

  const [isChangingGrind, setIsChangingGrind] = React.useState(false);
  const ingredientId = useObservation(item.ingredientId$) ?? null;
  const grindPercent = useObservation(item.grindPercent$) ?? 0;

  // We change the ingredientId during mouse over for live feedback, but this changes the ingredient id we wish to display.
  // We need to pin the previously selected id so that IngredientSelector works properly during the selection process.
  const displayIngredientId = isPreviewing
    ? savedIngredientRef.current
    : ingredientId;
  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      onMouseOver={isChangingGrind ? () => {} : onMouseOver}
      onMouseOut={isChangingGrind ? () => {} : onMouseOut}
    >
      <div>
        <Typography variant="overline">Ingredient</Typography>
      </div>
      <IngredientSelector
        fullWidth
        value={displayIngredientId}
        allowEmpty={displayIngredientId == null}
        // Store the last ingredient when we open, so we can return to it after closing without making a selection.
        onOpen={() => {
          savedIngredientRef.current = item.ingredientId;
          setIsPreviewing(true);
          isPreviewingRef.current = true;
        }}
        // Change the ingredient id with the mouse for a live preview.
        onMouseOverItem={(id) => {
          if (!isPreviewing) {
            return;
          }
          item.setIngredient(id);
        }}
        // Change our saved ingredient when the input is committed.  We will restore it when the input closes after the change.
        onChange={(id) => {
          setIsPreviewing(false);
          isPreviewingRef.current = false;
          item.setIngredient(id);
        }}
        onClose={() => {
          if (isPreviewingRef.current) {
            item.setIngredient(savedIngredientRef.current);
            setIsPreviewing(false);
            isPreviewingRef.current = false;
          }
          savedIngredientRef.current = null;
        }}
      />
      <Grid paddingTop={1}>
        <Typography id="grind-label">Grind Percent</Typography>
        <Slider
          value={grindPercent}
          onChange={(_, value) => {
            React.startTransition(() => {
              item.setGrindPercent(value as number);
            });
            setIsChangingGrind(true);
          }}
          onChangeCommitted={(_, value) => {
            item.setGrindPercent(value as number);
            setIsChangingGrind(false);
          }}
          aria-labelledby="grind-label"
          min={0}
          max={1}
          step={0.001}
        />
      </Grid>
    </PlotListItemCard>
  );
};

interface StirCauldronPlotListItemProps {
  item: StirCauldronPlotBuilderItem;
  highlight: boolean;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}

const StirCauldronPlotListItem = ({
  item,
  highlight,
  onMouseOver,
  onMouseOut,
}: StirCauldronPlotListItemProps) => {
  const [duration, setDuration] = React.useState("");
  const onTextFieldChanged = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }
      setDuration(e.target.value);

      React.startTransition(() => {
        item.setDistance(asNumber);
      });
    },
    [item]
  );
  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div>
        <Typography variant="overline">Stir Cauldron</Typography>
      </div>
      <TextField
        label="Distance"
        value={duration}
        onChange={onTextFieldChanged}
      />
    </PlotListItemCard>
  );
};

interface PourSolventPlotListItemProps {
  item: PourSolventPlotBuilderItem;
  highlight: boolean;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const PourSolventPlotListItem = ({
  item,
  highlight,
  onMouseOver,
  onMouseOut,
}: PourSolventPlotListItemProps) => {
  const [duration, setDuration] = React.useState("");
  const onTextFieldChanged = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setDuration(e.target.value);

      React.startTransition(() => {
        item.setDistance(asNumber);
      });
    },
    [item]
  );
  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div>
        <Typography variant="overline">Pour Solvent</Typography>
      </div>
      <TextField
        label="Distance"
        value={duration}
        onChange={onTextFieldChanged}
      />
    </PlotListItemCard>
  );
};

export default PlotBuilderItemsList;
