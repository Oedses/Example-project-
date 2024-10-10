import { ChartData, TooltipItem } from "chart.js";
import { ChartProps } from "react-chartjs-2";
import { externalTooltipHandler } from "./vertical-bar-chart.utils";

export type VerticalBarChartProps = {
  chartData?: ChartData<"bar", number[], string>;
  tooltipsLabels?: string[];
};

const useVerticalBarChart = ({ chartData, tooltipsLabels }: VerticalBarChartProps) => {
  const options: ChartProps<"bar", number[], string>["options"] = {
    scales: {
      yAxes: {
        ticks: {
          callback: (value) => `€ ${new Intl.NumberFormat('de-DE', { style: 'decimal' }).format(Number(value))}`
        }
      }
    },
    responsive: true,
    plugins: {
      tooltip: {
        titleFont: { weight: 'bold' },
        enabled: false,
        position: 'nearest' as any,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          beforeLabel: (tooltipItem: TooltipItem<"bar">): string[] => tooltipsLabels!,
          afterLabel: (tooltipItem: TooltipItem<"bar">): string[] => chartData?.datasets.map(dataset => dataset.data[tooltipItem.dataIndex].toString())!
        },
        external: externalTooltipHandler,
      }
    }
  };

  return {
    options,
    chartData
  };
};

export default useVerticalBarChart;