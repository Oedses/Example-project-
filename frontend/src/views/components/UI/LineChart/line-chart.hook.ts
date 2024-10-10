import { useRef } from "react";
import { getElementAtEvent } from "react-chartjs-2";
import { externalTooltipHandler } from "./line-chart.utils";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ChartData
} from 'chart.js';
import ChartContext from "../../../../store/contexts/chart-context";
import { getLastElement, createSeparatorsNumber } from "../../../../utils/fn";




ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type useLineChartProps = {
  chartData?: ChartData<"line", number[], string>;
  tooltipsLabels?: string[];
};

export const useLineChart = ({ chartData, tooltipsLabels }: useLineChartProps) => {
  const chartRef = useRef(null);

  const { data: { originalAmount } } = ChartContext.useContext();

  const onClick = (event: any) => {
    console.log(getElementAtEvent(chartRef.current!, event));
  };

  const dotsOptions = (window.location.pathname === '/admin/overview' ? { elements: {
    point:{ radius: 0 }
  } } : {});


  const labels = (tooltipItem: TooltipItem<"line">) => {
    const { dataIndex } = tooltipItem;

    if (chartData?.datasets?.length === 1) {
      const currentAmount = (chartData!.datasets[0].data[dataIndex] - (originalAmount[dataIndex]));

      return [
        currentAmount.toString(),
        (originalAmount[dataIndex] || getLastElement(originalAmount)).toString()
      ];
    }

    return chartData!.datasets.map(set => (set.data[dataIndex]).toString());
  };

  const yAxisDataset = chartData?.datasets?.length === 1 ? [ ...chartData?.datasets[0].data, ...originalAmount] : chartData?.datasets.reduce((acc, curr) => [...acc, ...curr.data], [] as number[]);

  const options = {
    interaction: {
      mode: 'index' as any,
      intersect: false,
    },
    ...dotsOptions,
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear' as any,
        position: 'right' as any,
        // max: Math.max(...chartData?.datasets[0].data!) + 100,
        max: Math.max(...yAxisDataset!) + 100,
        ticks: {
          stepSize: (Math.ceil(
            Math.max(
              // ...chartData?.datasets[0].data!
              ...yAxisDataset!
              ) / 1000
            ) * 1000) / 6,
          padding: 5,
          callback: createSeparatorsNumber,
        }
      },
      x: {
        position: 'right' as any,
        grid: { drawOnChartArea: false }
      },

    },
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
      tooltip: {
        titleFont: { weight: 'bold' },
        enabled: false,
        position: 'nearest' as any,
        model: 'label',
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          beforeBody: (tooltipItems: TooltipItem<"line">[]) => tooltipsLabels!,
          label: (tooltipItem: TooltipItem<"line">) => labels(tooltipItem),
        },
        external: externalTooltipHandler,
      }
    },
  };

  return { chartRef, onClick, options, chartData };
};