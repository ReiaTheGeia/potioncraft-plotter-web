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
  CardProps,
} from "@mui/material";
import { DragHandle } from "@mui/icons-material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

import { useObservation } from "@/hooks/observe";

import {
  AddIngredientPlotBuilderItem,
  PlotBuilder,
  PlotBuilderItem,
  PourSolventPlotBuilderItem,
  StirCauldronPlotBuilderItem,
  HeatVortexPlotBuilderItem,
} from "@/services/plotter/builder";
import { IngredientId } from "@/services/ingredients/types";

import DragReoderable from "./DragReorderable";
import IngredientSelector from "./IngredientSelector";
import IncDecSlider from "./IncDecSlider";

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
  "& .list-item-container": {
    position: "relative",
    marginBottom: theme.spacing(1),
  },
  "& .list-item-drag-handle": {
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(1),
  },
  "& .list-item": {
    position: "relative",
  },
  "& .list-item-content": {
    paddingTop: theme.spacing(4),
  },
  "& .list-item .delete-button": {
    position: "absolute",
    top: "5px",
    right: "15px",
  },
  "& .drop-indicator": {
    width: "100%",
    height: 0,
    borderBottom: "4px solid black",
    marginBottom: theme.spacing(1),
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
        <DragReoderable
          values={items}
          primaryAxis="top-to-bottom"
          dropIndicator={<div className="drop-indicator" />}
          onReorder={(_, p) => {
            builder.moveItem(items[p.fromIndex], p.toIndex);
          }}
        >
          {(value, params, getRootProps, getDragHandleProps) => (
            <div {...getRootProps()} className="list-item-container">
              <PlotListItem
                item={value}
                highlight={value === highlightItem}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
              />
              <div className="list-item-drag-handle" {...getDragHandleProps()}>
                <DragHandle />
              </div>
            </div>
          )}
        </DragReoderable>
      </ul>
      <div className="buttons">
        <Button color="primary" onClick={() => builder.addIngredient()}>
          <AddIcon /> Add Ingredient
        </Button>
        <Button color="primary" onClick={() => builder.addStirCauldron()}>
          <AddIcon /> Stir Cauldron
        </Button>
        <Button color="primary" onClick={() => builder.addPourSolvent()}>
          <AddIcon /> Pour Solvent
        </Button>
        <Button color="primary" onClick={() => builder.addHeatVortex()}>
          <AddIcon /> Heat Vortex
        </Button>
      </div>
    </Root>
  );
};

interface PlotListItemProps {
  item: PlotBuilderItem;
  cardProps?: CardProps;
  highlight?: boolean;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const PlotListItem = React.memo(
  React.forwardRef<HTMLDivElement, PlotListItemProps>(
    ({ item, cardProps, highlight = false, onMouseOver, onMouseOut }, ref) => {
      if (item instanceof AddIngredientPlotBuilderItem) {
        return (
          <AddIngredientPlotListItem
            ref={ref}
            item={item}
            cardProps={cardProps}
            highlight={highlight}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        );
      } else if (item instanceof StirCauldronPlotBuilderItem) {
        return (
          <StirCauldronPlotListItem
            ref={ref}
            item={item}
            cardProps={cardProps}
            highlight={highlight}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        );
      } else if (item instanceof PourSolventPlotBuilderItem) {
        return (
          <PourSolventPlotListItem
            ref={ref}
            item={item}
            cardProps={cardProps}
            highlight={highlight}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        );
      } else if (item instanceof HeatVortexPlotBuilderItem) {
        return (
          <HeatVortexPlotListItem
            ref={ref}
            item={item}
            cardProps={cardProps}
            highlight={highlight}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        );
      }
      return <div ref={ref}>Unknown PlotItem {item.constructor.name}</div>;
    }
  )
);

interface PlotListItemCardProps {
  item: PlotBuilderItem;
  highlight: boolean;
  cardProps?: CardProps;
  children: React.ReactNode;
  onMouseOver?(item: PlotBuilderItem): void;
  onMouseOut?(): void;
}

const PlotListItemCard = React.forwardRef<
  HTMLDivElement,
  PlotListItemCardProps
>(({ item, highlight, cardProps, children, onMouseOver, onMouseOut }, ref) => {
  const valid = useObservation(item.isValid$) ?? false;
  const onCardMouseOver = React.useCallback(() => {
    if (onMouseOver) {
      onMouseOver(item);
    }
  }, [onMouseOver, item]);
  const onDeleteClick = React.useCallback(() => item.delete(), [item]);
  return (
    <Card
      ref={ref}
      className="list-item"
      style={{
        backgroundColor:
          (!valid && "salmon") || (highlight && "lightblue") || undefined,
      }}
      onMouseOver={onCardMouseOver}
      onMouseOut={onMouseOut}
      {...cardProps}
    >
      <IconButton
        size="small"
        className="delete-button"
        onClick={onDeleteClick}
      >
        <DeleteIcon />
      </IconButton>
      <CardContent className="list-item-content">{children}</CardContent>
    </Card>
  );
});

interface AddIngredientPlotListItemProps {
  item: AddIngredientPlotBuilderItem;
  highlight: boolean;
  cardProps?: CardProps;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const AddIngredientPlotListItem = React.forwardRef<
  HTMLDivElement,
  AddIngredientPlotListItemProps
>(({ item, highlight, cardProps, onMouseOver, onMouseOut }, ref) => {
  const savedIngredientRef = React.useRef<IngredientId | null>(null);

  // Need both state (for rerender on change) and ref (to check it in a callback)
  const [isPreviewing, setIsPreviewing] = React.useState<boolean>(false);
  const isPreviewingRef = React.useRef(false);

  // Note: This is from when a transition was used to show the preview, we wanted
  // the slider to update live while the preview was not.  However, we no longer use
  // transitions as the system is now fast enough to deal without it.
  const [localGrind, setLocalGrind] = React.useState<number | null>(null);

  const [inputGrindPercent, setInputGrindPercent] = React.useState<
    string | null
  >(null);

  const ingredientId = useObservation(item.ingredientId$) ?? null;
  const grindPercent = useObservation(item.grindPercent$) ?? 0;

  const onIngredientSelectorOpen = React.useCallback(() => {
    savedIngredientRef.current = item.ingredientId;
    setIsPreviewing(true);
    isPreviewingRef.current = true;
  }, []);

  const onIngredientSelectorMouseOverItem = React.useCallback(
    (value: IngredientId) => {
      if (!isPreviewing) {
        return;
      }
      item.setIngredient(value);
    },
    [item]
  );

  const onIngredientSelectorChange = React.useCallback(
    (value: IngredientId | null) => {
      setIsPreviewing(false);
      isPreviewingRef.current = false;
      item.setIngredient(value);
    },
    [item]
  );

  const onIngredientSelectorClose = React.useCallback(() => {
    if (isPreviewingRef.current) {
      item.setIngredient(savedIngredientRef.current);
      setIsPreviewing(false);
      isPreviewingRef.current = false;
    }
    savedIngredientRef.current = null;
  }, [item]);

  const onGrindPercentTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value) / 100;
      if (isNaN(asNumber) || asNumber < 0 || asNumber > 1) {
        asNumber = null;
      }

      setInputGrindPercent(e.target.value);
      item.setGrindPercent(asNumber ?? 0);
    },
    [item]
  );

  const onGrindPercentBlur = React.useCallback(() => {
    setInputGrindPercent(null);
  }, []);

  const onSliderChange = React.useCallback(
    (_: any, value: number | number[]) => {
      item.setGrindPercent(value as number);
      setLocalGrind(value as number);
    },
    [item]
  );

  const onSliderChangeCommitted = React.useCallback(
    (_: any, value: number | number[]) => {
      item.setGrindPercent(value as number);
      setLocalGrind(null);
    },
    [item]
  );

  // We change the ingredientId during mouse over for live feedback, but this changes the ingredient id we wish to display.
  // We need to pin the previously selected id so that IngredientSelector works properly during the selection process.
  const displayIngredientId = isPreviewing
    ? savedIngredientRef.current
    : ingredientId;
  return (
    <PlotListItemCard
      ref={ref}
      item={item}
      cardProps={cardProps}
      highlight={highlight}
      onMouseOver={localGrind != null ? undefined : onMouseOver}
      onMouseOut={localGrind != null ? undefined : onMouseOut}
    >
      <div>
        <Typography variant="overline">Ingredient</Typography>
      </div>
      <IngredientSelector
        fullWidth
        value={displayIngredientId}
        allowEmpty={displayIngredientId == null}
        // Store the last ingredient when we open, so we can return to it after closing without making a selection.
        onOpen={onIngredientSelectorOpen}
        // Change the ingredient id with the mouse for a live preview.
        onMouseOverItem={onIngredientSelectorMouseOverItem}
        // Change our saved ingredient when the input is committed.  We will restore it when the input closes after the change.
        onChange={onIngredientSelectorChange}
        onClose={onIngredientSelectorClose}
      />
      <Grid paddingTop={1}>
        <TextField
          label="Grind Percent"
          value={inputGrindPercent ?? grindPercent * 100}
          onChange={onGrindPercentTextChange}
          onBlur={onGrindPercentBlur}
        />
        <Slider
          value={localGrind ?? grindPercent}
          onChange={onSliderChange}
          onChangeCommitted={onSliderChangeCommitted}
          min={0}
          max={1}
          step={0.001}
        />
      </Grid>
    </PlotListItemCard>
  );
});

interface StirCauldronPlotListItemProps {
  item: StirCauldronPlotBuilderItem;
  highlight: boolean;
  cardProps?: CardProps;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}

const StirCauldronPlotListItem = React.forwardRef<
  HTMLDivElement,
  StirCauldronPlotListItemProps
>(({ item, highlight, cardProps, onMouseOver, onMouseOut }, ref) => {
  const distance = useObservation(item.distance$);
  const [inputDistance, setInputDistance] = React.useState<string | null>(null);

  const onTextFieldChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setInputDistance(e.target.value);
      item.setDistance(asNumber);
    },
    [item]
  );
  const onTextFieldBlur = React.useCallback(() => {
    setInputDistance(null);
  }, []);
  const onDistanceChange = React.useCallback(
    (value: number) => {
      item.setDistance(Math.max(0, Number(value.toFixed(3))));
    },
    [item]
  );

  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      cardProps={cardProps}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div>
        <Typography variant="overline">Stir Cauldron</Typography>
      </div>
      <TextField
        label="Distance"
        value={inputDistance ?? distance ?? ""}
        onChange={onTextFieldChange}
        onBlur={onTextFieldBlur}
      />
      <IncDecSlider
        value={distance ?? 0}
        rate={10}
        onChange={onDistanceChange}
      />
    </PlotListItemCard>
  );
});

interface PourSolventPlotListItemProps {
  item: PourSolventPlotBuilderItem;
  highlight: boolean;
  cardProps?: CardProps;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const PourSolventPlotListItem = React.forwardRef<
  HTMLDivElement,
  PourSolventPlotListItemProps
>(({ item, highlight, cardProps, onMouseOver, onMouseOut }, ref) => {
  const distance = useObservation(item.distance$);
  const [inputDistance, setInputDistance] = React.useState<string | null>(null);

  const onTextFieldChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setInputDistance(e.target.value);
      item.setDistance(asNumber);
    },
    [item]
  );
  const onTextFieldBlur = React.useCallback(() => {
    setInputDistance(null);
  }, []);
  const onDistanceChange = React.useCallback(
    (value: number) => {
      item.setDistance(Math.max(0, Number(value.toFixed(3))));
    },
    [item]
  );

  return (
    <PlotListItemCard
      ref={ref}
      item={item}
      cardProps={cardProps}
      highlight={highlight}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div>
        <Typography variant="overline">Pour Solvent</Typography>
      </div>
      <TextField
        label="Distance"
        value={inputDistance ?? distance ?? ""}
        onChange={onTextFieldChange}
        onBlur={onTextFieldBlur}
      />
      <IncDecSlider
        value={distance ?? 0}
        rate={10}
        onChange={onDistanceChange}
      />
    </PlotListItemCard>
  );
});

interface HeatVortexPlotListItemProps {
  item: HeatVortexPlotBuilderItem;
  highlight: boolean;
  cardProps?: CardProps;
  onMouseOver(item: PlotBuilderItem): void;
  onMouseOut(): void;
}
const HeatVortexPlotListItem = React.forwardRef<
  HTMLDivElement,
  HeatVortexPlotListItemProps
>(({ item, highlight, cardProps, onMouseOver, onMouseOut }, ref) => {
  const distance = useObservation(item.distance$);
  const [inputDistance, setInputDistance] = React.useState<string | null>(null);

  const onTextFieldChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let asNumber: number | null = Number(e.target.value);
      if (isNaN(asNumber)) {
        asNumber = null;
      }

      setInputDistance(e.target.value);
      item.setDistance(asNumber);
    },
    [item]
  );
  const onTextFieldBlur = React.useCallback(() => {
    setInputDistance(null);
  }, []);
  const onDistanceChange = React.useCallback(
    (value: number) => {
      item.setDistance(Math.max(0, Number(value.toFixed(3))));
    },
    [item]
  );

  return (
    <PlotListItemCard
      item={item}
      highlight={highlight}
      cardProps={cardProps}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div>
        <Typography variant="overline">Heat Vortex</Typography>
      </div>
      <TextField
        label="Distance"
        value={inputDistance ?? distance ?? ""}
        onChange={onTextFieldChange}
        onBlur={onTextFieldBlur}
      />
      <IncDecSlider
        value={distance ?? 0}
        rate={10}
        onChange={onDistanceChange}
      />
    </PlotListItemCard>
  );
});

export default PlotBuilderItemsList;
