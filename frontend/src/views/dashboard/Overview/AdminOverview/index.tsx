import { Fragment } from "react";

import { hoc } from "../../../../utils";

import { Heading } from "../../../components/UI/Heading";
import { BarLabel } from "../../../components/UI/HorizontalStackedBar/BarLabel";
import { List } from "../../../components/UI/List";
import { Section } from "../../../components/UI/Section";
import VerticalBarChart from "../../../components/UI/VerticalBarChart";

import { useOverview } from "./overview.hook";
import "./overview.scss";

const AdminOverview = hoc(
  useOverview,
  ({
    t,
    name,
    width,
    platformOverview,
    platformOverviewPercents,
    chartData,
    tooltips,
    transactionVolumeLabelData
  }) => (
    <Fragment>
      <div className="content">

        <section className="content__header">
          <Heading view="main" active>
            {t('pages.admin.overview.title')} {name}
          </Heading>

        </section>

          <section className="admin-overview__content">
            <Section className='admin-overview__section admin-overview__overview'>
              <Heading view="secondary" active>
                {t('pages.admin.overview.platformOverview.title')}
              </Heading>

              <List
                items={platformOverview}
                withBadges
                badgesValues={platformOverviewPercents}
                type={width! > 620 ? "horizontal" : "vertical"}
              />
            </Section>

            <Section className="admin-overview__section admin-overview__volume admin-overview__relative">
              <Heading view="secondary" active>
                {t('pages.admin.overview.transactionVolume')}
              </Heading>

              <section className='admin-overview__chart-labels'>
                {transactionVolumeLabelData.map(item => (
                  <BarLabel
                    key={item.additionalStyle?.labelColor}
                    item={item.item}
                    wrapperClassName='admin-overview__chart-label'
                    additionalStyle={item.additionalStyle}
                    label={t(item.item.data.label)}
                  />
                ))}
              </section>

            {chartData?.isShow && (
              <section>
                <VerticalBarChart chartData={chartData.values} tooltipsLabels={tooltips} />
              </section>
            )}
          </Section>
        </section>
      </div>
    </Fragment>
  ));

export default AdminOverview;
