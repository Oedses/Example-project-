import React, { ChangeEvent, Fragment, useMemo } from 'react';
import { ChartData } from 'chart.js';
import classnames from 'classnames';

import { PortfolioIcon } from '../../../components/icons';
import Button from '../../../components/UI/Button';
import { Heading } from '../../../components/UI/Heading';
import { LineChart } from '../../../components/UI/LineChart';
import { List } from '../../../components/UI/List';
import { ListItemProps } from '../../../components/UI/List/ListItem';
import { Section } from '../../../components/UI/Section';
import Tabs from '../../../components/UI/Tabs';
import { Tab } from '../../../components/UI/Tabs/Tab';

import './portfolio-summary.scss';
import DatePicker from '../../../components/UI/DatePicker';
import { ButtonView } from '../../../components/UI/Button/button.props';
import { Label, ObjWithKeys } from "../../../../../../shared/types/common";
import { useTranslation } from 'react-i18next';
import { getChartCategories } from './portfolio-summary.constants';

export type PortfolioSummaryProps = {
  isPortfolioFetching: boolean;
  isFetchedWithError: boolean;
  portfolioSummaryList: ListItemProps[];
  width: number;
  chartData: ChartData<"line", number[], string>;
  tooltips: string[]
  onViewClick?: (to: string) => void;
  onTabChange?: (selected: string) => void;
  chartCategory?: Label;
  onPeriodRangeChange: (range: string[]) => void;
  periodRange?: string[]
};

const PortfolioSummary = ({
  isPortfolioFetching,
  isFetchedWithError,
  portfolioSummaryList,
  width,
  chartData,
  tooltips,
  onViewClick,
  onTabChange,
  chartCategory,
  onPeriodRangeChange,
  periodRange
}: PortfolioSummaryProps) => {
  const { t, i18n } = useTranslation();

  const datePickerClassnames = classnames("date-range-picker__container");
  const datePickerErrorClassnames = classnames("date-range-picker__container overview__error");

  const chartCategories: ObjWithKeys<Label> = useMemo(() => getChartCategories(), [i18n.language]);

  const onDateFromChange = (event: ChangeEvent<HTMLInputElement>) => onPeriodRangeChange([event.target.value ?? new Date(), periodRange![1]]);

  const onDateToChange = (event: ChangeEvent<HTMLInputElement>) => onPeriodRangeChange([periodRange![0], event.target.value ?? new Date()]);

  const checkValidateTime = () => {
    if (periodRange![0] && periodRange![1]) {
      const time =
        new Date(periodRange![1]).getTime() -
        new Date(periodRange![0]).getTime();

      if (time < 0) {
        return "The start date can’t be more than end date";
      }
    }

    return "";
  };

  const chartDataMemo = useMemo(() => {
    if (chartCategories.period) {
      const indexFilter: number[] = [];

      const { labels = [], datasets = [] } = chartData;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      labels.forEach((item, i) => {
        const [day, month, year] = item.split("-");

        const dateData = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10)
        ).getTime();

        if (dateData > today.getTime()) {
          indexFilter.push(i);
        }
      });

      return {
        labels: labels.filter((item, i) => !indexFilter.includes(i)),
        datasets: datasets.map((item) => ({
          ...item,
          data: item.data.filter((el, i) => !indexFilter.includes(i)),
        })),
      };
    }

    return chartData;
  }, [chartData]);

  return (
    <Section className="overview__section overview__summary">
      <Heading view="secondary" active>
        {t('pages.overview.porifolio.title')}
      </Heading>

      {!isPortfolioFetching && !isFetchedWithError ? (
        <Fragment>
          <List
            items={portfolioSummaryList}
            type={width! > 620 ? "horizontal" : "vertical"}
          />

          {width! > 500 ? (
            <Fragment>
              {chartCategory?.value === chartCategories.period.value && (
                <div>
                  <section className={datePickerClassnames}>
                    <DatePicker
                      date={new Date(periodRange![0])}
                      onChange={onDateFromChange}
                    />

                    &nbsp;—&nbsp;

                    <DatePicker
                      date={new Date(periodRange![1])}
                      onChange={onDateToChange}
                    />
                  </section>
                  <section className={datePickerErrorClassnames}>
                    {checkValidateTime()}
                  </section>
                </div>

              )}

              <Tabs selectedId={chartCategory!} onChange={onTabChange!}>
                <Fragment>
                  {Object.entries(chartCategories).map((item) => (
                    <Tab
                      key={item[0]}
                      title={item[1].label}
                      id={item[1].value}
                      rightAddons={undefined}
                    >
                      <LineChart
                        chartData={chartDataMemo}
                        tooltipsLabels={tooltips}
                      />
                    </Tab>
                  ))}
                </Fragment>
              </Tabs>
            </Fragment>
          ) : <></>}
        </Fragment>
      ) : (
        <section>
          <Heading view="accent" active>
            {t('pages.portfolio.empty')}
          </Heading>
        </section>
      )}

      {onViewClick && (
        <section className="overview__portfolio-footer overview__section-footer">
          <Button
            view={ButtonView.unfilled}
            onClick={() => onViewClick('portfolio')}
          >
            <PortfolioIcon width="16px" height="16px" />

            {t('pages.overview.porifolio.view')}
          </Button>
        </section>
      )}

    </Section>
  );
};

export { PortfolioSummary };