import { lazy } from 'react';
import { hoc } from "../../../utils";

import { Heading } from "../../components/UI/Heading";
import { HorizontalStackedBar } from "../../components/UI/HorizontalStackedBar";
import { Section } from "../../components/UI/Section";
import Table from "../../components/UI/Table";
import { PortfolioSummary } from "./PortfolioSummary";

import { usePortfolio } from "./portfolio.hook";

import "./portfolio.scss";

const Transactions = lazy(() => import('../Transactions'));

const PortfolioView = hoc(
  usePortfolio,
  ({
    t,
    width,
    portfolioList,
    chartData,
    dataForChart,
    tableBody,
    tableHeader,
    tooltips,
    isPortfolioFetching,
    isFetchedWithError,
    onChartTabChange,
    chartCategory,
    onPeriodRangeChange,
    periodRange,
    maxStackedChartLength
  }) => (
    <div className="content">
      <section className="content__header">
        <Heading view="main" active>
          {t("pages.portfolio.title")}
        </Heading>
      </section>

      <PortfolioSummary
        isPortfolioFetching={isPortfolioFetching}
        isFetchedWithError={isFetchedWithError}
        portfolioSummaryList={portfolioList}
        width={width!}
        chartData={chartData!}
        tooltips={tooltips}
        onTabChange={onChartTabChange!}
        chartCategory={chartCategory}
        onPeriodRangeChange={onPeriodRangeChange}
        periodRange={periodRange}
      />

      <Section className="portfolio__section portfolio__holdings">
        <Heading view="secondary" active>
          {t("pages.portfolio.holdings")}
        </Heading>

        {tableBody?.length ? (
          <HorizontalStackedBar
            data={dataForChart}
            showPercents
            maxLength={maxStackedChartLength}
          />
        ) : null}

        <Table
          theadData={tableHeader}
          tbodyData={tableBody}
          sortedFields={{ indexes: [2] }}
          centeredColumns={[2, 3, 4, 5]}
          emptyState={t("pages.portfolio.table.empty")}
        />
      </Section>

      <Section className="portfolio__section portfolio__transactions">
        <Transactions isPageTransactions={false} />
      </Section>
    </div>
  )
);

export default PortfolioView;
