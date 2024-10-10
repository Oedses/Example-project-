import Context from "./context";

export type ChartStore = {
  originalAmount: number[];
};

export const initialChartState: ChartStore = {
  originalAmount: []
};

const ChartContext = new Context(initialChartState);

export default ChartContext;