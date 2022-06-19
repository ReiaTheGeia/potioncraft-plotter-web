import React from "react";
import { Typography, Card, CardContent } from "@mui/material";

import { useDICreate } from "@/container";

import { useObservation } from "@/hooks/observe";

import { PlotBuilderItem } from "@/components/PlotBuilderView/builder";

import Overlay from "@/components/Overlay";
import PlotBuilderView from "@/components/PlotBuilderView";

import { ChallengePageViewModel } from "./ChallengePageViewModel";
import { sum } from "lodash";

const ChallengePage = () => {
  const viewModel = useDICreate(ChallengePageViewModel);

  const results = useObservation(viewModel.results$) ?? null;

  return (
    <PlotBuilderView
      viewModel={viewModel}
      mapOverlay={
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
                  Total Score:{" "}
                  {sum(Object.keys(results).map((k) => results[k].score))}
                </Typography>
              )}
              {results && (
                <Typography>
                  Keep tweaking your path to increase your score!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Overlay>
      }
    />
  );
};

export default ChallengePage;
