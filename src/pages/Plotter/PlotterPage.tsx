import React from "react";
import { styled } from "@mui/material";

import { useDICreate, useDIDependency } from "@/container";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";
import { History } from "@/services/history/History";

import PlotBuilderItemsList from "@/components/PlotBuilderItemsList";

import PlotBuilderView from "@/components/PlotBuilderView";

import { PlotterPageViewModel } from "./PlotterPageViewModel";

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .divider": {
    width: "2px",
    height: "100%",
    background: "grey",
  },
  "& .plot-items": {
    width: "400px",
    height: "100%",
  },
}));

const PlotterPage = () => {
  const history = useDIDependency(History);
  const viewModel = useDICreate(PlotterPageViewModel);

  const builder = viewModel.builder;

  const highlightItem = useObservation(viewModel.mouseOverBuilderItem$) ?? null;
  const outputShareString =
    useObservation(viewModel.shareString$, { useTransition: true }) ?? null;

  React.useEffect(() => {
    const query = new URLSearchParams(history.location.search);
    if (query.has("data")) {
      const data = query.get("data")!;
      viewModel.loadFromShareString(data);
    }
  }, [history]);

  React.useEffect(() => {
    if (!outputShareString) {
      return;
    }
    const query = new URLSearchParams(history.location.search);
    query.set("data", outputShareString);
    history.replace({
      search: query.toString(),
    });
  }, [history, outputShareString]);

  const onBuildItemMouseOver = React.useCallback(
    (item: PlotBuilderItem) => {
      viewModel.onMouseOverBuilderItem(item);
    },
    [viewModel]
  );

  const onBuildItemMouseOut = React.useCallback(() => {
    viewModel.onMouseOverBuilderItem(null);
  }, [viewModel]);

  return (
    <Root>
      <PlotBuilderView viewModel={viewModel} />
      <div className="divider" />
      <PlotBuilderItemsList
        className="plot-items"
        plotBuilderItemCollection={builder}
        highlightItem={highlightItem}
        enableCheats
        onMouseOver={onBuildItemMouseOver}
        onMouseOut={onBuildItemMouseOut}
      />
    </Root>
  );
};

export default PlotterPage;
