import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import AdminService from "../../../../services/AdminService";

import UserContext from "../../../../store/contexts/user-context";

import { AdminChartData, AdminOverview } from "../../../../../../shared/types/admin";

import { showDeltaPercents, translate, transpose, enableScroll, summ, summToRight } from "../../../../utils/fn";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { labels as monthsLabels } from "../../../components/UI/LineChart/line-chart.constants";

import {
  createChartData,
  platformOverviewLabels,
  tooltipLabels,
  transactionVolumeLabelData,
} from "./overview.constants";

export const useOverview = () => {
  const { data: { name, id } } = UserContext.useContext();

  const [chartDatasets, setChartDatasets] = useState<AdminChartData>([]);

  const [platformOverview, setPlatformOverview] = useState<ListItemProps[]>([]);

  const [platformOverviewPercents, setPlatformOverviewPercents] = useState<(number | null)[]>([]);

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const platformOverviewList: ListItemProps[] = [
    {
      title: t(platformOverviewLabels[0]),
      content: "",
      isAmount: true,
      contentClasses: "admin-overview__recieved-amount",
    },
    {
      title: t(platformOverviewLabels[1]),
      content: "",
      isAmount: true,
    },
    {
      title: t(platformOverviewLabels[2]),
      content: "",
      isAmount: true,
    },
    {
      title: t(platformOverviewLabels[3]),
      content: "",
      contentClasses: "list-item__montserrat",
    },
  ];

  const tooltips = translate(tooltipLabels);

  const chartData = useMemo(() => {
    const numbers = chartDatasets.map(item => Object.entries(item).map(value => value[1] || 0).slice(1));

    let prevSumma = 0;
    const totalVolumes = numbers.map((item, index) => {
      prevSumma += (index > 0 ? summ(numbers[index - 1]) : 0);
      return (summ(item)) + prevSumma;
    });

    let datasetsData = transpose(numbers)
      .map((item) => summToRight(item));

    datasetsData.push(totalVolumes);

    const datasets = createChartData(tooltips, datasetsData);

    const labels = chartDatasets.map(item => `${monthsLabels[item.period].slice(0, 3)} ${new Date().getFullYear()}`);

    return {
      isShow: datasets.every(dataset => dataset?.data?.length),
      values: { labels, datasets }
    };
  }, [chartDatasets]);


  useEffect(() => {
    if (id) {
      enableScroll();

      AdminService.getOverview(id)
        .then(res => {
          const response: AdminOverview = res.data;

          const {
            chartData: chartInfo,
            lastPeriodPayment,
            lastPeriodTransactions,
            lastPeriodVolume,
            lastPeriodProcessingVolume
          } = response;

          const portfolioOverviewValues = [
            lastPeriodVolume.currentValue,
            lastPeriodProcessingVolume.currentValue,
            lastPeriodPayment.currentValue,
            lastPeriodTransactions.currentValue
          ];

          setChartDatasets(chartInfo);

          setPlatformOverviewPercents([
            showDeltaPercents(lastPeriodVolume.currentValue, lastPeriodVolume.previousValue),
            showDeltaPercents(lastPeriodProcessingVolume.currentValue, lastPeriodProcessingVolume.previousValue),
            showDeltaPercents(lastPeriodPayment.currentValue, lastPeriodPayment.previousValue),
            showDeltaPercents(lastPeriodTransactions.currentValue, lastPeriodTransactions.previousValue)
          ]);

          const platformOverviewData = platformOverviewList.map((item, index) => ({
            ...item,
            // title: t(platformOverviewLabels[index]),
            content: portfolioOverviewValues[index].toString()
          }));

          setPlatformOverview(platformOverviewData);
        })
        .catch(error => console.log(error));
    }
  }, [id, i18n.language ]);

  return {
    t,
    i18n,
    name,
    width,
    platformOverview,
    platformOverviewPercents,
    chartData,
    tooltips,
    transactionVolumeLabelData
  };
};