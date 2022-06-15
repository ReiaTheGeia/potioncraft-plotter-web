import React from "react";
import { styled, Typography, Card, CardContent } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/services/plotter/builder";

import PlotBuilderItemsList from "@/components/PlotBuilderItemsList";
import Overlay from "@/components/Overlay";
import PlotBuilderView from "@/components/PlotBuilderView";

import { ChallengePageViewModel } from "./ChallengePageViewModel";
import { sum } from "lodash";

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
  const results = useObservation(viewModel.results$) ?? null;

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
        <Overlay position="top">
          <Card>
            <CardContent>
              <Typography variant="h6" textAlign="center">
                Daily Challenge
              </Typography>
              <Typography variant="body1" textAlign="center">
                {viewModel.description}
              </Typography>
              {results && (
                <table>
                  <tbody>
                    {Object.keys(results).map((key) => (
                      <tr>
                        <td>{key}</td>
                        <td>{results[key].value}</td>
                        <td>{results[key].score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {results && (
                <Typography variant="overline">
                  Final score:{" "}
                  {sum(Object.keys(results).map((k) => results[k].score))}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Overlay>
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
