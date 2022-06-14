import React from "react";
import { styled, Typography, Card, CardContent } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/services/plotter/builder";

import PlotBuilderItemsList from "@/components/PlotBuilderItemsList";

import PlotBuilderView from "@/components/PlotBuilderView";

import { ChallengePageViewModel } from "./ChallengePageViewModel";

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  "& .builder-view-container": {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  "& .score": {
    position: "absolute",
    top: "0",
    left: "50%",
  },
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

const ChallengePage = () => {
  const viewModel = useDICreate(ChallengePageViewModel);

  const builder = viewModel.builder;

  const highlightItem = useObservation(viewModel.mouseOverBuilderItem$) ?? null;
  const score = useObservation(viewModel.score$) ?? null;

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
      <div className="builder-view-container">
        <PlotBuilderView viewModel={viewModel} />
        <Card className="score">
          <CardContent>
            <Typography variant="h6">
              Score: {score ?? "Challenge Incomplete"}
            </Typography>
          </CardContent>
        </Card>
      </div>
      <div className="divider" />
      <PlotBuilderItemsList
        className="plot-items"
        plotBuilderItemCollection={builder}
        highlightItem={highlightItem}
        onMouseOver={onBuildItemMouseOver}
        onMouseOut={onBuildItemMouseOut}
      />
    </Root>
  );
};

export default ChallengePage;
