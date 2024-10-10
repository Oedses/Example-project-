import classNames from 'classnames';
import { Fragment } from 'react';
import { capitalize } from '../../../utils/fn';

import { hoc } from '../../../utils/hoc';
import { Pagination, Popup } from '../../components/UI';
import { Heading } from '../../components/UI/Heading';
import { Spinner } from '../../components/UI/Spinner';
import Table from '../../components/UI/Table';
import Tabs from '../../components/UI/Tabs';
import { Tab } from '../../components/UI/Tabs/Tab';

import RejectComplianceForm from '../Overview/ComplianceOverview/RejectComplianceForm';
import ComplianceFilters from './ComplianceFilters';
import ComplianceDetails from './ComplianceDetails';
import HeaderButtonsBar from './HeaderButtonsBar';

import { useComplianceLog } from './compliances.hook';
import "./compliances.scss";

type TypeMappingComplianceStatus = {
  [key: string]: string;
};

const MappingComplianceStatus: TypeMappingComplianceStatus = {
  Initiated: "pages.complianceLog.complianceStatus.initiated",
  Accepted: "pages.complianceLog.complianceStatus.accepted",
  Rejected: "pages.complianceLog.complianceStatus.rejected",
  all: "pages.complianceLog.complianceStatus.all",
};



const ComplianceLog = hoc(useComplianceLog, ({
  t,
  withTitle,
  isCompliancePage,
  isPagination,
  complianceLogRows,
  isComplianceLogFetching,
  complianceLogTableHeader,
  showRejectForm,
  onCloseRejectForm,
  skip,
  limitStep,
  total,
  goNextPage,
  goPrevPage,
  onTabChange,
  setShowFilters,
  updatePageByFilter,
  exportResult,
  showFilters,
  selectedTab,
  complianceCategories,
  showFromCount,
  complianceDetails,
  onCloseComplianceDetails,
  callbackActionCompliance
}) => {
  const TableFragment = complianceLogRows?.length ? (
    <Fragment>
      <Table
        theadData={complianceLogTableHeader}
        tbodyData={complianceLogRows}
        sortedFields={{ indexes: [0] }}
        emptyState={t('pages.complianceLog.table.empty')}
      />

      {isPagination && <Pagination
        from={showFromCount}
        to={skip + limitStep}
        total={total}
        delta={limitStep}
        showNext={goNextPage}
        showPrev={goPrevPage}
        disabledNext={showFromCount + limitStep > total}
      />}
    </Fragment>
  ) : (
    <Heading view="accent" active>
      {t('pages.complianceLog.table.empty')}
    </Heading>
  );

  const TableContent = isCompliancePage
    ? (
      <Tabs selectedId={selectedTab} onChange={onTabChange}>
        <Fragment>
          {Object.entries(complianceCategories).map((item) => (
            <Tab
              key={item[0]}
              title={capitalize(t(MappingComplianceStatus[item[0]]))}
              id={item[0]}
              rightAddons={item[1]}
            >
              {TableFragment}
            </Tab>
          ))}
        </Fragment>
      </Tabs>
    )
    : TableFragment;

  return (
    <Fragment>
      <Popup visible={showRejectForm} onClose={onCloseRejectForm}>
        <RejectComplianceForm callback={callbackActionCompliance} />
      </Popup>

      {complianceDetails && <Popup visible={!!complianceDetails} onClose={onCloseComplianceDetails}>
        <ComplianceDetails complianceDetails={complianceDetails} onClose={onCloseComplianceDetails} callback={callbackActionCompliance} />
      </Popup>}

      <div className={classNames({ 'content': isCompliancePage })}>
        {withTitle && (
          <div className="content__header">
            <Heading
              view="main"
              active
            >
              {t("pages.complianceLog.title")}
            </Heading>

          </div>
        )}

        <section className="admin-overview__content">
          <div className={classNames({ 'section admin-overview__section admin-overview__compliance-log': isCompliancePage })}>
            {withTitle ? (
              <HeaderButtonsBar
                onShowFilters={() => setShowFilters(!showFilters)}
                onExportResults={exportResult}
              />
            ) : (
              <div className="header-container">
                <Heading view='secondary' active>
                  {t('pages.complianceLog.title')}
                </Heading>
                <HeaderButtonsBar
                  onShowFilters={() => setShowFilters(!showFilters)}
                  onExportResults={exportResult}
                />
              </div>
            )}
            <ComplianceFilters visible={showFilters} isMainFilter={isCompliancePage} updatePageByFilter={updatePageByFilter} />
            <div className='overview__compliance-log-content' >
              {isComplianceLogFetching ? (
                <Spinner />
              ) : TableContent}
            </div>
          </div>
        </section>
      </div>
    </Fragment>
  );
});

export default ComplianceLog;
