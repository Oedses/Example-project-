import { Fragment } from "react";

import { hoc } from "../../../../utils";

import { ProductsIcon, TransactionsIcon } from "../../../components/icons";
import Button from "../../../components/UI/Button";
import { ButtonView } from "../../../components/UI/Button/button.props";
import { Heading } from "../../../components/UI/Heading";
import { HorizontalStackedBar } from "../../../components/UI/HorizontalStackedBar";
import { List } from "../../../components/UI/List";
import Popup from "../../../components/UI/Popup";
import { Section } from "../../../components/UI/Section";
import { Spinner } from "../../../components/UI/Spinner";
import Table from "../../../components/UI/Table";
import TransactionDetails from "../../Transactions/TransactionDetails";

import { useOverview } from "./overview.hook";

import "./overview.scss";

const Overview = hoc(
  useOverview,
  ({
    t,
    name,
    width,
    platformSummaryList,
    productsTableHeader,
    products,
    onViewClick,
    isProductsFetching,
    transactionsTableHeader,
    transactions,
    isTransactionsFetching,
    productsRef,
    transactionsRef,
    stackedBarData,
    isStackedBarDataShow,
    isOverviewfetching,
    onRequestDeactivate,
    transactionDetails,
    onCloseTransactionDetails
  }) => {
    return (
      <div className="content">
        {transactionDetails && <Popup visible={!!transactionDetails} onClose={onCloseTransactionDetails}>
          <TransactionDetails transactionDetails={transactionDetails} />
        </Popup>}
        <section className="content__header">
          <Heading view="main" active>
            {t('pages.issuer.overview.title')} {name}
          </Heading>

          <Button
            view={ButtonView.redLayout}
            onClick={onRequestDeactivate}
          >
            {t('pages.investors.view.deactivate')}
          </Button>
        </section>

        <section className="issuer-overview__content">

          <Section className="issuer-overview__section issuer-overview__summary">
            <Heading view="secondary" active>
              {t('pages.issuer.overview.platformOverview.title')}
            </Heading>

            {isOverviewfetching ? (
              <Spinner />
            ) : (
              <Fragment>
                <List
                  items={platformSummaryList}
                  type={width! > 620 ? "horizontal" : "vertical"}
                />

                {isStackedBarDataShow && <HorizontalStackedBar showAmount data={stackedBarData} />}
              </Fragment>
            )}

          </Section>

          <Section className="issuer-overview__section issuer-overview__products">
            <Heading view="secondary" active>
              {t('pages.issuer.overview.myProducts.title')}
            </Heading>

            <div className='issuer-overview__products-content' ref={productsRef}>
              {isProductsFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={productsTableHeader}
                  tbodyData={products}
                  sortedFields={{ indexes: [0] }}
                  centeredColumns={[2, 3]}
                  emptyState={t('pages.overview.products.table.empty')}
                />
              )}
            </div>

            <section className="issuer-overview__products-footer issuer-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('products')}
              >
                <ProductsIcon width="16px" height="16px" />

                {t('pages.overview.products.viewMore')}
              </Button>
            </section>
          </Section>

          <Section className="issuer-overview__section issuer-overview__transactions">
            <Heading view="secondary" active>
              {t('pages.issuer.overview.myProductsTransactions.title')}
            </Heading>

            <section className='issuer-overview__transactions-content' ref={transactionsRef}>
              {isTransactionsFetching ? (
                <Spinner />
              ) : (
                <Table
                  theadData={transactionsTableHeader}
                  tbodyData={transactions}
                  sortedFields={{ indexes: [4] }}
                  centeredColumns={[4]}
                  emptyState={t('pages.overview.transactions.table.empty')}
                />
              )}
            </section>

            <section className="issuer-overview__transactions-footer issuer-overview__section-footer">
              <Button
                view={ButtonView.unfilled}
                onClick={() => onViewClick('transactions')}
              >
                <TransactionsIcon width="16px" height="16px" />

                {t('pages.overview.transactions.viewMore')}
              </Button>
            </section>
          </Section>
        </section>
      </div>
    );
  }
);

export default Overview;
