import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InvestorFilters } from '../../../../../shared/types/investor';

import { createQueryString, delay, translate, exportToXLSX } from '../../../utils';
import InvestorService from '../../../services/InvestorService';

import { Row } from '../../components/UI/Table';
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import {
  createInvestorsRows,
  createInvestorsExportData,
  initialCategories,
  InvestorsCategories,
  limitStep,
  rolesForCreate,
  theadData
} from './investors.constants';
import UserContext from '../../../store/contexts/user-context';
import { Query } from '../../../../../shared/types/response';
import { AccountStatus, Label } from '../../../../../shared/types/common';

type InvestorsTabs = {
  [key in keyof InvestorsCategories]: Label
};

const investorsTabs: InvestorsTabs = {
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

export const useInvestors = () => {
  const { data: { role }  } = UserContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [isFetching, setIsFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [topFilter, setTopFilter] = useState<InvestorFilters | null>(null);

  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const [investorRows, setInvestorRows] = useState<Row[]>([]);

  const [selectedTab, setSelectedTab] = useState<Label>(investorsTabs.all);
  const [investorsCategories, setInvestorsCategories] =
    useState<InvestorsCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const onToggleForm = () => setShowForm(show => !show);

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(investorsTabs, selected));
    setSkip(0);
  };

  const updatePageByFilter = (filterValue: InvestorFilters) => {
    setTopFilter(filterValue);
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

  const updateInvestorsList = (isExport: boolean = false) => {
    if (!showForm) {
      delay(() => {
        setIsFetching(!isExport);

        const limitValue = isExport ? 0 : limitStep;

        const query: Query = {
          skip,
          limit: limitValue,
          ...(searchValue ? { name: searchValue } : {}),
          ...(selectedTab.value === investorsTabs.all.value ? {} : { status: selectedTab.value })
        };

        if (topFilter) {
          if (topFilter.startDate) query.startDate = topFilter.startDate.toDateString();
          if (topFilter.endDate) query.endDate = topFilter.endDate.toDateString();
          if (topFilter.entityType) query.entityType = topFilter.entityType.id;
          if (topFilter.startTotalProducts) query.startTotalProducts = topFilter.startTotalProducts;
          if (topFilter.endTotalProducts) query.endTotalProducts = topFilter.endTotalProducts;
        }

        InvestorService.getList(createQueryString(query))
          .then((res) => {
            const { data, count, totals } = res.data;

            if (isExport) {
              const dataToExport = createInvestorsExportData(data);

              exportToXLSX(dataToExport, "investors_data");
            } else {
              const rows: Row[] = createInvestorsRows(data);

              setTotal(count);
              setInvestorRows(rows);

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

              setInvestorsCategories(updatedCategories);
            }
            
          })
          .finally(() => setIsFetching(false));
      }, 500);
    }
  };

  const exportResult = () => updateInvestorsList(true);

  useEffect(() => setTableHeader(translate(theadData)), [i18n.language]);

  useEffect(() => {
    if (topFilter) {
      updateInvestorsList();
    }
  }, [topFilter]);

  useEffect(() => {
    setSelectedTab(investorsTabs.all);
    updateInvestorsList();
  }, [searchValue, showForm, skip]);

  useEffect(() => {
    setSkip(0);
    setShowFromCount(1);
  }, [searchValue]);

  useEffect(() => {
    if (selectedTab.value === investorsTabs.all.value) {
      setShowFromCount(skip + 1);
      setTotal(investorsCategories.all);
      return updateInvestorsList();
    }

    updateInvestorsList();
    setShowFromCount(1);
  }, [selectedTab, i18n.language]);
  return {
    t,
    i18n,
    searchValue,
    setSearchValue,
    investorRows,
    tableHead: tableHeader,
    skip,
    limitStep,
    total,
    goNextPage,
    goPrevPage,
    showFilters,
    setShowFilters,
    updatePageByFilter,
    exportResult,
    isFetching,
    showFromCount,
    selectedTab,
    investorsCategories,
    onTabChange,
    showForm,
    onToggleForm,
    isCreateAllowed: rolesForCreate.includes(role)
  };
};
