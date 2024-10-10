import { Fragment, lazy } from "react";

import {
  capitalize,
  hoc
} from "../../../utils";

import { PlusIcon, SearchIcon } from "../../components/icons";
import { Button, Input, Pagination, Table } from "../../components/UI";
import { Heading } from "../../components/UI/Heading";
import { Spinner } from "../../components/UI/Spinner";
import InvestorFilters from "./InvestorFilters";
import HeaderButtonsBar from "../Compliances/HeaderButtonsBar";
import Tabs from "../../components/UI/Tabs";
import { Tab } from "../../components/UI/Tabs/Tab";

const CreateInvestorForm = lazy(() => import("./CreateInvestorForm"));

import { MappingInvestorsCategory } from "./investors.constants";
import { useInvestors } from "./investors.hook";
import "./investors.scss";

const InvestorsView = hoc(
  useInvestors,
  ({
    t,
    searchValue,
    setSearchValue,
    investorRows,
    tableHead,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    isFetching,
    showFromCount,
    showFilters,
    setShowFilters,
    updatePageByFilter,
    exportResult,
    selectedTab,
    investorsCategories,
    onTabChange,
    showForm,
    onToggleForm,
    isCreateAllowed
  }) => (
    <div className="content">
      <div className="content__header">
        <Heading
          view="main"
          active
        >
          {t("pages.investors.title")}
        </Heading>

        {isCreateAllowed ? (
          <Button onClick={onToggleForm}>
            <PlusIcon width="16px" height="16px" />
            {t("pages.investors.newInvestor")}
          </Button>
        ) : null}

        {showForm && <CreateInvestorForm visible={showForm} onClose={onToggleForm} />}
      </div>

      <div className="section table-container">
        <div className="header-container">
          <Input
            className="investors__search"
            icon={<SearchIcon width="16px" height="16px" />}
            name="name"
            inputProps={{
              value: searchValue,
              onChange: (e) => setSearchValue(e.target.value),
              placeholder: t('pages.investors.inputPlaceholder'),
              disabled: showForm,
              autoComplete: !showForm ? 'on' : 'off',
              autoCorrect: !showForm ? 'on' : 'off'
            }}
          />
          <HeaderButtonsBar
            onShowFilters={() => setShowFilters(!showFilters)}
            onExportResults={exportResult}
          />
        </div>
        <InvestorFilters visible={showFilters} updatePageByFilter={updatePageByFilter} />
        {isFetching ? <Spinner /> : (
          <Fragment>
            <Tabs selectedId={selectedTab} onChange={onTabChange}>
              <Fragment>
                {Object.entries(investorsCategories).map((item) => (
                  <Tab
                    key={item[0]}
                    title={capitalize(t(MappingInvestorsCategory[item[0]]))}
                    id={item[0]}
                    rightAddons={item[1]}
                  >
            {investorRows?.length ? (
              <Fragment>
                <Table
                  theadData={tableHead}
                  tbodyData={investorRows}
                  sortedFields={{ indexes: [0] }}
                  centeredColumns={[4, 5]}
                />

                <Pagination
                  from={showFromCount}
                  to={skip + limitStep}
                  total={total}
                  delta={limitStep}
                  showNext={goNextPage}
                  showPrev={goPrevPage}
                  disabledNext={showFromCount + limitStep > total }
                />
              </Fragment>
            ) : (
              <Heading view="accent" active>
                {t('pages.investors.table.empty')}
              </Heading>
            )}
            </Tab>
                ))}
              </Fragment>
            </Tabs>
          </Fragment>
        )}

      </div>
    </div>
  )
);

export default InvestorsView;
