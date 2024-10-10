import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { hoc } from '../../../../utils';

import useVerticalBarChart from './vertical-bar-chart.hook';

import './../LineChart/line-chart.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
);

const VarticalBarChart = hoc(useVerticalBarChart, ({ options, chartData }) => (
  <Bar options={options} data={chartData} />
));

export default VarticalBarChart;