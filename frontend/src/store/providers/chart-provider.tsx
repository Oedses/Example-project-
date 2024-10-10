import { FC } from "react";
import ChartContext, { initialChartState } from "./../contexts/chart-context";
import Provider from "./provider";

const ChartProvider: FC = ({ children }) => (
  <Provider
    initialState={initialChartState}
    ContextComponent={ChartContext}
  >
    {children}
  </Provider>
);

export default ChartProvider;