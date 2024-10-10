import { Line } from "react-chartjs-2";

import { hoc } from "../../../../utils";

import { useLineChart } from "./line-chart.hook";

import './line-chart.scss';

const LineChart = hoc(useLineChart, ({ chartRef, onClick, options, chartData }) => (
  <Line ref={chartRef} onClick={onClick} options={options} data={chartData} />
));

export { LineChart };