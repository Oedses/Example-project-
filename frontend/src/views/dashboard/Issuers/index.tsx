import { Fragment, lazy } from "react";

import { hoc } from "../../../utils/hoc";

import { PlusIcon, SearchIcon } from "../../components/icons";
import { Button, Input, Pagination } from "../../components/UI";
import Table from "../../components/UI/Table";
import { Spinner } from "../../components/UI/Spinner";
import { Heading } from "../../components/UI/Heading";
import IssuerFilters from "./IssuerFilters";
import HeaderButtonsBar from "../Compliances/HeaderButtonsBar";
import { Tab } from "../../components/UI/Tabs/Tab";
import { capitalize } from "../../../utils/fn";
import Tabs from "../../components/UI/Tabs";

import { useTransactions } from "./issuers.hook";
import { MappingIssuerCategory } from "./issuers.constants";
import "./issuers.scss";

const CreateIssuerForm = lazy(() => import("./CreateIssuerForm"));

const IssuersView = hoc(
  useTransactions,
  ({
    t,
    tableHead,
    onToggleForm,
    showForm,
    issuersRows,
    isFetching,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    showFilters,
    setShowFilters,
    updatePageByFilter,
    exportResult,
    issuersCategories,
    selectedTab,
    onTabChange,
    showFromCount,
    searchValue,
    setSearchValue,
    isCreateAllowed
  }) => (
    <div className="content">
      <div className="content__header">
        <Heading view="main" active>
          {t('pages.admin.issuers.title')}
        </Heading>

        {isCreateAllowed ? (
          <Button onClick={onToggleForm}>
            <PlusIcon width="16px" height="16px" />
              {t('pages.admin.issuers.new')}
          </Button>
        ) : null}

        {showForm && <CreateIssuerForm visible={showForm} onClose={onToggleForm} />}
      </div>

      <div className="section table-container">
        <div className="header-container">
          <Input
            className="issuers__search"
            icon={<SearchIcon width="16px" height="16px" />}
            name="name"
            inputProps={{
              value: searchValue,
              onChange: (e) => setSearchValue(e.target.value),
              placeholder: t("pages.issuer.inputPlaceholder"),
            }}
          />
          <HeaderButtonsBar
            onShowFilters={() => setShowFilters(!showFilters)}
            onExportResults={exportResult}
          />
        </div>
        <IssuerFilters visible={showFilters} updatePageByFilter={updatePageByFilter} />
        {isFetching ? (
          <Spinner />
        ) : (
          <Fragment>
            <Tabs selectedId={selectedTab} onChange={onTabChange}>
              <Fragment>
                {Object.entries(issuersCategories).map((item) => (
                  <Tab
                    key={item[0]}
                    title={capitalize(t(MappingIssuerCategory[item[0]]))}
                    id={item[0]}
                    rightAddons={item[1]}
                  >
                    {issuersRows?.length ? (
                      <Fragment>
                        <Table
                          theadData={tableHead}
                          tbodyData={issuersRows}
                          sortedFields={{ indexes: [0] }}
                          centeredColumns={[3, 4]}
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
                        {t("pages.admin.issuers.table.empty")}
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

export default IssuersView;
