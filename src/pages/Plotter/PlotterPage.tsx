import React from "react";

import { useDICreate, useDIDependency } from "@/container";

import { useObservation } from "@/hooks/observe";

import { History } from "@/services/history/History";

import PlotBuilderView from "@/components/PlotBuilderView";

import { PlotterPageViewModel } from "./PlotterPageViewModel";

const PlotterPage = () => {
  const history = useDIDependency(History);
  const viewModel = useDICreate(PlotterPageViewModel);

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

  return <PlotBuilderView viewModel={viewModel} enableCheats />;
};

export default PlotterPage;
