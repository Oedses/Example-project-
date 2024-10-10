/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AccountStatus, Label } from "../../../../../shared/types/common";
import { Issuer, IssuerFilters } from "../../../../../shared/types/issuer";
import { Query } from "../../../../../shared/types/response";

import IssuerService from "../../../services/IssuerService";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, delay, translate, exportToXLSX, capitalize } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

// import Validation from "./CreateIssuerForm/validation";

import { theadData, limitStep, createIssuersRows, createIssuersExportData, rolesForCreate } from "./issuers.constants";

type IssuerCategories = {
  [key in AccountStatus]: number;
} & { all: number };

type InvestorsTabs = {
  [key in keyof IssuerCategories]: Label
};

const issuersTabs: InvestorsTabs = {
  Processing: {
    value: 'Processing',
    label: 'Processing'
  },
  Active: {
    value: 'Active',
    label: 'Active'
  },
  Inactive: {
    value: 'Inactive',
    label: 'Inactive'
  },
  Failed: {
    value: 'Failed',
    label: 'Failed'
  },
  Rejected: {
    value: 'Rejected',
    label: 'Rejected'
  },
  all: {
    value: 'all',
    label: 'All'
  }
};

const initialCategories = Object.keys(AccountStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [capitalize(curr)]: 0 }), {}) as IssuerCategories;

export const useTransactions = () => {
  const { data: { role } } = UserContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [topFilter, setTopFilter] = useState<IssuerFilters | null>(null);

  const [issuers, setIssuers] = useState<Issuer[]>([]);

  const [selectedTab, setSelectedTab] = useState<Label>(issuersTabs.all);
  const [searchValue, setSearchValue] = useState("");

  const [issuersRows, setIssuersRows] = useState<Row[]>([]);

  const [issuersCategories, setIssuersCategories] =
    useState<IssuerCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const isCreateAllowed = useMemo(() => rolesForCreate.includes(role), [role, rolesForCreate]);

  const updatePageByFilter = (filterValue: IssuerFilters) => {
    setTopFilter(filterValue);
  };

  const onToggleForm = () => {
    // Validation.reset();
    setShowForm(!showForm);
  };

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(issuersTabs, selected));
    setSkip(0);
  };

  const getIssuerList = (isExport: boolean = false) => {
    const search = searchValue.trim();
  
    setIsFetching(!isExport);

    const limitValue = isExport ? 0 : limitStep;

    const query: Query = {
      skip,
      limit: limitValue,
      ...(search ? { name: search } : {}),
      ...(selectedTab.value === issuersTabs.all.value ? {} : { status: selectedTab.value })
    };

    if (topFilter) {
      if (topFilter.startDate) query.startDate = topFilter.startDate.toDateString();
      if (topFilter.endDate) query.endDate = topFilter.endDate.toDateString();
    }

    IssuerService.getList(createQueryString(query))
      .then((res) => {
        const { data, count, totals } = res.data;

        if (isExport) {
          const dataToExport = createIssuersExportData(data);

          exportToXLSX(dataToExport, "issuers_data");
        } else {
          const rows: Row[] = createIssuersRows(data);
          setIssuers(data);
          setTotal(count);
          setIssuersRows(rows);
  
          const totalCategories = totals?.reduce((acc, curr) => acc + curr.count, 0)!;
          const updatedCategories = totals?.reduce(
            (acc, curr) => {
              return {
                ...acc,
                [curr.label as AccountStatus]: curr.count,
                all: totalCategories
              };
            }, initialCategories
          )!;
  
          setIssuersCategories(updatedCategories);
        }
      })
      .finally(() => setIsFetching(false));
  };

  const exportResult = () => getIssuerList(true);

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

  useEffect(() => setTableHeader(translate(theadData)), [i18n.language]);

  useEffect(() => {
    if (topFilter) {
      getIssuerList();
    }
  }, [topFilter]);

  useEffect(() => {
    setSelectedTab(issuersTabs.all);

    if (!showForm) {
      delay(() => {
        getIssuerList();
      }, 500);
    }
  }, [searchValue, showForm, skip]);

  useEffect(() => {
    setSkip(0);
    setShowFromCount(1);
  }, [searchValue]);

  useEffect(() => {
    if (selectedTab.value === issuersTabs.all.value) {
      setShowFromCount(skip + 1);
      setTotal(issuersCategories.all);
      return getIssuerList();
    }

    getIssuerList();
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);

  return {
    t,
    tableHead: tableHeader,
    onToggleForm,
    showForm,
    issuersRows,
    isFetching,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    exportResult,
    showFilters,
    setShowFilters,
    updatePageByFilter,
    issuersCategories,
    selectedTab,
    onTabChange,
    showFromCount,
    searchValue,
    setSearchValue,
    isCreateAllowed
  };
};
