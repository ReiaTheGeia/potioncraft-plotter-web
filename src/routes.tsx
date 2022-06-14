import React from "react";
import { Route, Routes } from "react-router";

import IndexPage from "./pages/Index";
import PlotterPage from "./pages/Plotter";
import ChallengePage from "./pages/Challenge";

const AppRoutes = () => (
  <Routes>
    {/* TODO: If we hit the index with a ?data=, redirect to plotter?data= */}
    <Route index element={<IndexPage />} />
    <Route path="/plotter" element={<PlotterPage />} />
    <Route path="/daily-challenge" element={<ChallengePage />} />
  </Routes>
);

export default AppRoutes;
