import { Fragment } from "react";

import { hoc } from "./../../../utils/hoc";

import { PlusIcon } from "../../components/icons";
import { Button, Pagination, Popup } from "../../components/UI";
import Table from "../../components/UI/Table";
import { Spinner } from "../../components/UI/Spinner";
import { Heading } from "../../components/UI/Heading";
import CreateTransactionForm from "./CreateTransactionForm";

import { useTransactions } from "./transactions.hook";
import "./transactions.scss";
import { Tab } from "../../components/UI/Tabs/Tab";
import { capitalize, isInvestor } from "../../../utils/fn";
import Tabs from "../../components/UI/Tabs";
import { MappingTransactionCategory } from './transactions.constants';
import classNames from "classnames";
import TransactionDetails from "./TransactionDetails";
import TransactionFilters from './TransactionFilters';
import HeaderButtonsBar from "../Compliances/HeaderButtonsBar";

const TransactionsView = hoc(useTransactions, ({
  t,
  tableHead,
  onToggleForm,
  showForm,
  transactionRows,
  isFetching,
  skip,
  limitStep,
  total,
  detailType,
  goNextPage,
  goPrevPage,
  exportResult,
  transactionsCategories,
  selectedTab,
  setShowFilters,
  updatePageByFilter,
  onTabChange,
  showFilters,
  showFromCount,
  isCreateAllowed,
  centeredTransactionsColumns,
  transactionTableScrollRef,
  role,
  isPageTransactions,
  transactionDetails,
  onCloseTransactionDetails
}) => {
  const TableFragment = transactionRows?.length ? (
    <Fragment>
      <Table
        theadData={tableHead}
        tbodyData={transactionRows}
        sortedFields={{ indexes: [3] }}
        multiSortFields={[2, 3, 4]}
        centeredColumns={centeredTransactionsColumns}
      />

      <Pagination
        scrollRef={transactionTableScrollRef}
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
      {t('pages.transactions.table.empty')}
    </Heading>
  );

  const TableContent = isPageTransactions
    ? (
      <Tabs selectedId={selectedTab} onChange={onTabChange}>
        <Fragment>
          {Object.entries(transactionsCategories).map((item) => (
            <Tab
              key={item[0]}
              title={capitalize(t(MappingTransactionCategory[item[0]]))}
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
      {transactionDetails && <Popup visible={!!transactionDetails} onClose={onCloseTransactionDetails}>
        <TransactionDetails transactionDetails={transactionDetails} isPageTransactions={isPageTransactions} detailType={detailType} />
      </Popup>}
      <div className={classNames({
        'content': isPageTransactions
      })}>
        {isPageTransactions && (
          <div className="content__header">
            <Heading view="main" active>
              {isInvestor(role) ? t("pages.transactions.investorTitle") : t("pages.transactions.title")}
            </Heading>

            {isCreateAllowed && (
              <Fragment>
                <Button onClick={onToggleForm}>
                  <PlusIcon width="16px" height="16px" />
                  {t("pages.transactions.newTransaction")}
                </Button>

                {showForm && <CreateTransactionForm visible={showForm} onClose={onToggleForm} />}
              </Fragment>
            )}
          </div>
        )}

        <div 
          ref={transactionTableScrollRef} 
          className={classNames({
          'section table-container': isPageTransactions
          })}
        >
            {isPageTransactions ? (
              <HeaderButtonsBar
                onShowFilters={() => setShowFilters(!showFilters)}
                onExportResults={exportResult}
              />
            ) : (
              <div className="header-container">
                <Heading view='secondary' active>
                  {t('pages.investors.view.transactions.title')}
                </Heading>
                <HeaderButtonsBar
                  onShowFilters={() => setShowFilters(!showFilters)}
                  onExportResults={exportResult}
                />
              </div>
            )}
            <TransactionFilters visible={showFilters} isMainFilter={isPageTransactions} detailType={detailType} updatePageByFilter={updatePageByFilter} />
            <div className='overview__transactions-content' >
              {isFetching ? (
                <Spinner />
              ) : TableContent}
            </div>
        </div>
      </div>
    </Fragment>
  );
});

export default TransactionsView;
