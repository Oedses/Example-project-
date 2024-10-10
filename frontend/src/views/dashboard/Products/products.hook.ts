import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../../../../../shared/types/common";
import { Product, ProductCategory, ProductFilters } from "../../../../../shared/types/product";
import { Query } from "../../../../../shared/types/response";

import ProductService from "../../../services/ProductService";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, delay, translate, exportToXLSX } from "../../../utils";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import { centeredColumns, createProductRows, createProductsExportData, limitStep, rolesForCreate, theadData } from "./products.constants";

type ProductsCategories = {
  [key in ProductCategory]: number;
} & { all: number };


type ProductsTabs = {
  [key in keyof ProductsCategories]: Label
};

const initialCategories = Object.keys(ProductCategory)
  .reduce((acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as ProductsCategories;

  const productsTabs: ProductsTabs = {
    Bond: {
      value: 'Bond',
      label: 'Bond'
    },
    Certificate: {
      value: 'Certificate',
      label: 'Certificate'
    },
    Share: {
      value: 'Share',
      label: 'Share'
    },
    all: {
      value: 'all',
      label: 'All'
    }
  };

export const useProducts = () => {
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [topFilter, setTopFilter] = useState<ProductFilters | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productRows, setProductRows] = useState<Row[]>([]);

  const [selectedTab, setSelectedTab] = useState<Label>(productsTabs.all);
  const [searchValue, setSearchValue] = useState("");

  const [productsCategories, setProductsCategories] = useState<ProductsCategories>({ ...initialCategories });

  const { data: { role } } = UserContext.useContext();

  const { t, i18n } = useTranslation();

  const centeredProductsColumns = useMemo(() =>role && centeredColumns[role], [role]);

  const onToggleForm = () => setShowForm(!showForm);

  const updatePageByFilter = (filterValue: ProductFilters) => {
    setTopFilter(filterValue);
  };

  const onTabChange = (selected: string) => {
    setSkip(0);
    // setIsFetching(true);
    setSelectedTab(getCurrentTab(productsTabs, selected));
  };

  const viewNewPage = (newSkip: number) => {
    setIsFetching(true);
    setSkip(newSkip);
    setShowFromCount(newSkip + 1);
  };

  const goNextPage = () => {
    const newSkip = skip + limitStep;

    if (newSkip > total) return;

    viewNewPage(newSkip);
  };

  const goPrevPage = () => {
    const newSkip = skip - limitStep;

    if (newSkip < 0) return;

    viewNewPage(newSkip);
  };

  const updateProdcutsList = (isExport: boolean = false) => {
    if (!showForm) {
      delay(() => {
        setIsFetching(!isExport);

        const search = searchValue.trim();

        const limitValue = isExport ? 0 : limitStep;

        const query: Query = {
          skip,
          limit: limitValue,
          ...(selectedTab.value !== productsTabs.all.value ? { categories: selectedTab.value } : {}),
          ...(search ? { name: search } : {})
        };

        if (topFilter) {
          if (topFilter.paymentType) query.paymentType = topFilter.paymentType.id;
          if (topFilter.startCouponRate) query.startCouponRate = topFilter.startCouponRate;
          if (topFilter.endCouponRate) query.endCouponRate = topFilter.endCouponRate;
          if (topFilter.issuer) query.issuer = topFilter.issuer.id;
        }

        ProductService.getList(createQueryString(query))
          .then((res) => {
            const { data, count } = res.data;

            if (isExport) {
              const dataToExport = createProductsExportData(data, role);

              exportToXLSX(dataToExport, "products_data");
            } else {
              const rows: Row[] = createProductRows(data, role);

              setProducts(data);
              setProductRows(rows);

              setTotal(count);

              type Counts = {
                [key: string]: number;
              } & { all: number; };

              const productCaregoriesData: Counts = res.data.totals.reduce((acc, curr) => {
                return { ...acc, [curr.category]: curr.count, all: acc.all + curr.count };
              }, {
                  all: 0,
                  Bond: 0,
                  Certificate: 0,
                  Share: 0
              });

              setProductsCategories(productCaregoriesData as ProductsCategories);
            }
          })
          .finally(() => setIsFetching(false));
      }, 500);
    }
  };

  const exportResult = () => updateProdcutsList(true);

  useEffect(() => setTableHeader(translate(theadData(role))), [role, i18n.language]);

  useEffect(() => {
    if (topFilter) {
      updateProdcutsList();
    }
  }, [topFilter]);
  

  useEffect(() => {
    if (role) updateProdcutsList();
  }, [searchValue, showForm, skip, role, selectedTab]);

  useEffect(() => {
    setSkip(0);
    setShowFromCount(1);
  }, [searchValue]);

  useEffect(() => {
    if (selectedTab.value === productsTabs.all.value) {
      setShowFromCount(skip + 1);
      setTotal(productsCategories.all);
      return setProductRows(createProductRows(products, role));
    }

    const filteredProducts = products.filter(product => (
      product?.category === selectedTab.value
    ));

    setProductRows(createProductRows(filteredProducts, role));
    setTotal(filteredProducts.length);
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);

  return {
    t,
    onToggleForm,
    showForm,
    searchValue,
    setSearchValue,
    tableHead: tableHeader,
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
    isCreateAllowed: rolesForCreate.includes(role),
    centeredProductsColumns
  };
};
