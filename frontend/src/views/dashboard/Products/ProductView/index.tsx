import React, { Fragment } from "react";

import { Roles, Status } from "../../../../../../shared/types/common";

import { hoc } from "../../../../utils";

import { Button, Table } from "../../../components/UI";
import { Breadcrumps } from "../../../components/UI/Breadcrumps";
import { Heading } from "../../../components/UI/Heading";
import { HorizontalStackedBar } from "../../../components/UI/HorizontalStackedBar";
import { List } from "../../../components/UI/List";
import { Section } from "../../../components/UI/Section";
import { Spinner } from "../../../components/UI/Spinner";

import { RequestBuyForm } from "./RequestBuy";

import { useProductView } from "./product-view.hook";
import "./produst-view.scss";
import { ButtonView } from "../../../components/UI/Button/button.props";
import TransactionsView from "../../Transactions";

const ProductView = hoc(
  useProductView,
  ({
    t,
    isInvestor,
    role,
    isFetching,
    breadcrumps,
    product,
    productDetailsList,
    productOverviewList,
    myHoldingsList,
    holdingsRows,
    investorsRows,
    investorsTableHead,
    myHoldingsTableHead,
    stackedBarData,
    // documentsTableHead,
    // documentsTableData,
    width,
    id,
    userId,
    onDeactivateClick,
    isRequestBuyShow,
    onToggleRequestBuy,
    requestBuyData,
    isRequestBuyAvailable,
    isDeactivateAllowed,
    isRequestDeactivateProduct,
    isShowInvestorsAllowed,
    getProduct
  }) => (
    <section className="product-view">
      <div className="content-wrapper">
        <div className="content">
          {isFetching ? (
            <Spinner />
          ) : (
            <Fragment>
              <section className="content__header">
                <Breadcrumps items={breadcrumps} />

                {!isFetching && userId && isDeactivateAllowed ? (
                  <Button
                    view={ButtonView.redLayout}
                    onClick={onDeactivateClick}
                    disabled={isRequestDeactivateProduct}
                  >
                    {t("pages.products.view.deactivateProduct")}
                  </Button>
                ) : (
                  role === Roles.investor && product?.status === Status.active && (
                    <Button
                      view={ButtonView.green}
                      onClick={onToggleRequestBuy}
                    >
                      {t("pages.products.view.requestBuy.buttonText")}
                    </Button>
                  )
                )}

                {isRequestBuyAvailable
                  ? isRequestBuyShow && (
                      <RequestBuyForm
                        visible={isRequestBuyShow}
                        data={requestBuyData}
                        onClose={onToggleRequestBuy}
                        getProduct={getProduct}
                      />
                    )
                  : null}
              </section>

              <section className="product-view__content">
                <article className="product-view__right">
                  <Section className="product-view__details">
                    <Heading view="secondary" active>
                      {t("pages.products.view.productDetails.title")}
                    </Heading>

                    <List items={productDetailsList} type="vertical" />
                  </Section>
                </article>

                <article className="product-view__left">
                  <Section className="product-view__section product-view__overview">
                    <Heading view="secondary" active>
                      {t("pages.products.view.productOverview.title")}
                    </Heading>

                    {stackedBarData?.length ? (
                      <Fragment>
                        <List
                          items={productOverviewList}
                          type={
                            width! >
                            (productOverviewList.length > 3 ? 620 : 450)
                              ? "horizontal"
                              : "vertical"
                          }
                        />

                        <HorizontalStackedBar
                          data={stackedBarData}
                          showAllLabels
                          showAmount
                        />
                      </Fragment>
                    ) : (
                      <Heading view="accent" active>
                        No data yet...
                      </Heading>
                    )}
                  </Section>

                  {isInvestor && (
                    <Section className="product-view__section product-view__my-holdings">
                      <Heading view="secondary" active>
                        {t("pages.products.view.myHoldings.title")}
                      </Heading>

                      {holdingsRows?.length ? (
                        <List
                          items={myHoldingsList}
                          type={width! > 620 ? "horizontal" : "vertical"}
                        />
                      ) : null}

                      <div className="product-view__table">
                        <Table
                          theadData={myHoldingsTableHead}
                          tbodyData={holdingsRows}
                          emptyState={t(
                            "pages.products.view.myHoldings.table.emptyState"
                          )}
                        />
                      </div>
                    </Section>
                  )}

                  {/* <Section className='product-view__section product-view__documents'>
                    <Heading view='secondary' active>
                    {t('pages.products.view.documents.title')}
                    </Heading>

                    <div className="product-view__table">
                      <Table
                        theadData={documentsTableHead}
                        tbodyData={documentsTableData}
                        emptyState={t('pages.products.view.documents.table.emptyState')}
                      />
                    </div>
                  </Section> */}

                  {isShowInvestorsAllowed && (
                    <Section className="product-view__section product-view__investors">
                      <Heading view="secondary" active>
                          {t("pages.products.view.investors.title")}
                      </Heading>

                      <div className="product-view__table">
                        <Table
                          theadData={investorsTableHead}
                          tbodyData={investorsRows}
                          sortedFields={{ indexes: [0] }}
                          centeredColumns={[1, 2]}
                          emptyState={t(
                            "pages.products.view.investors.table.emptyState"
                          )}
                        />
                      </div>
                    </Section>
                  )}

                  <Section className="product-view__section product-view__transactions">
                    <div className="product-view__table">
                      <TransactionsView isPageTransactions={false} productId={id} />
                    </div>
                  </Section>
                </article>
              </section>
            </Fragment>
          )}
        </div>
      </div>
    </section>
  )
);

export default ProductView;
