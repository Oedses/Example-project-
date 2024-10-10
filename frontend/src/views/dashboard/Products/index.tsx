import { Fragment } from "react";

import { capitalize, hoc } from "../../../utils";

import Table from "../../components/UI/Table";
import { Button, Input, Pagination } from "../../components/UI";
import { PlusIcon, SearchIcon } from "../../components/icons";
import CreateProductForm from "./CreateProductForm";
import { Spinner } from "../../components/UI/Spinner";
import { Heading } from "../../components/UI/Heading";
import Tabs from "../../components/UI/Tabs";
import { Tab } from "../../components/UI/Tabs/Tab";
import { MappingProductCategory } from './products.constants';
import { useProducts } from "./products.hook";
import ProductFilters from "./ProductFilters";
import HeaderButtonsBar from "../Compliances/HeaderButtonsBar";
import "./products.scss";


const ProductsView = hoc(
  useProducts,
  ({
    t,
    onToggleForm,
    showForm,
    searchValue,
    setSearchValue,
    tableHead,
    productRows,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    exportResult,
    showFilters,
    setShowFilters,
    updatePageByFilter,
    isFetching,
    onTabChange,
    selectedTab,
    productsCategories,
    showFromCount,
    isCreateAllowed,
    centeredProductsColumns
  }) => (
    <div className="content">
      <div className="content__header">
        <Heading view="main" active>
          {t("pages.products.title")}
        </Heading>

        {isCreateAllowed && (
          <Fragment>
            <Button onClick={onToggleForm}>
              <PlusIcon width="16px" height="16px" />
              {t("pages.products.newProduct")}
            </Button>

            {showForm && <CreateProductForm visible={showForm} onClose={onToggleForm} />}
          </Fragment>
        )}
      </div>

      <div className="section table-container">
        <div className="header-container">
          <Input
            className="products__search"
            icon={<SearchIcon width="16px" height="16px" />}
            name="name"
            inputProps={{
              value: searchValue,
              onChange: (e) => setSearchValue(e.target.value),
              placeholder: t("pages.products.inputPlaceholder"),
            }}
          />
          <HeaderButtonsBar
              onShowFilters={() => setShowFilters(!showFilters)}
              onExportResults={exportResult}
          />
        </div>
        <ProductFilters visible={showFilters} updatePageByFilter={updatePageByFilter} />
        <Tabs selectedId={selectedTab} onChange={onTabChange}>
          <Fragment>
            {Object.entries(productsCategories).map((item) => (
              <Tab
                key={item[0]}
                title={capitalize(t(MappingProductCategory[item[0]]))}
                id={item[0]}
                rightAddons={item[1]}
              >
                {isFetching ? (
                  <Spinner />
                ) : (
                  productRows?.length ? (
                    <Fragment>
                      <Table
                        theadData={tableHead}
                        tbodyData={productRows}
                        sortedFields={{ indexes: [0] }}
                        centeredColumns={centeredProductsColumns}
                        emptyState={t("pages.products.table.empty")}
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
                      {t("pages.products.table.empty")}
                    </Heading>
                  )
                )}
              </Tab>
            ))}
          </Fragment>
        </Tabs>
      </div>
    </div>
  )
);

export default ProductsView;
