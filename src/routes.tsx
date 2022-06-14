import React from "react";
import { Route, Routes } from "react-router";

import IndexPage from "./pages/Index";
import PlotterPage from "./pages/Plotter";

const AppRoutes = () => (
  <Routes>
    {/* TODO: If we hit the index with a ?data=, redirect to plotter?data= */}
    <Route index element={<IndexPage />} />
    <Route path="/plotter" element={<PlotterPage />} />
  </Routes>
);

export default AppRoutes;
