import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ComplianceLogItem, ComplianceStatus, Label } from "../../../../../shared/types/common";
import { ComplianceCategory, ComplianceFilters } from "../../../../../shared/types/compliance";
import { Query } from "../../../../../shared/types/response";

import AdminService from "../../../services/AdminService";

import ComplianceContext from "../../../store/contexts/compliance-log-context";
import UserContext from "../../../store/contexts/user-context";

import { createQueryString, translate, exportToXLSX } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import {
  complianceLogTHeader,
  createComplianceLogRows,
  createComplianceLogExportData,
  limitStep as defaultLimitStep,
} from "./compliances.constants";

export type ComplianceCategories = ComplianceCategory & { all: number };


type ComplianceTabs = {
  [key in keyof ComplianceCategories]: Label
};

const initialCategories = Object.keys(ComplianceStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [curr]: 0 }), {}) as ComplianceCategories;

const complianceTabs: ComplianceTabs = {
  Initiated: {
    value: 'Initiated',
    label: 'Initiated',
  },
  Accepted: {
    value: 'Accepted',
    label: 'Accepted',
  },
  Rejected: {
    value: 'Rejected',
    label: 'Rejected',
  },
  all: {
    value: 'all',
    label: 'All',
  }
};

type UseComplianceLogProps = {
  limitStep?: number;
  withTitle?: boolean;
  isCompliancePage?: boolean;
  isPagination?: boolean;
  relatedUserId?: string;
  callbackAction?: () => void;
};

const useComplianceLog = ({ limitStep, withTitle = true, isCompliancePage = true, isPagination = true, callbackAction, relatedUserId, }: UseComplianceLogProps) => {
  const {
    data: { id },
  } = UserContext.useContext();
  const {
    data: { rejectLogId, logs: compliances },
    setData: setComplianceData,
  } = ComplianceContext.useContext();

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({});
  const [showFromCount, setShowFromCount] = useState(1);

  const [showFilters, setShowFilters] = useState(false);

  const [complianceLogRows, setComplianceLogRows] = useState<Row[]>([]);
  const [complianceDetails, setComplianceDetails] = useState<ComplianceLogItem | null>(null);
  const [topFilter, setTopFilter] = useState<ComplianceFilters | null>(null);
  const [selectedTab, setSelectedTab] =
    useState<Label>(complianceTabs.all);

  const [isComplianceLogFetching, setComplianceLogFetching] = useState(true);

  const [complianceCategories, setComplianceCategories] =
    useState<ComplianceCategories>({ ...initialCategories });

  const { t, i18n } = useTranslation();

  const onCloseRejectForm = () => setComplianceData({ rejectLogId: "" });

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(complianceTabs, selected));
    setSkip(0);
  };

  const updatePageByFilter = (filterValue: ComplianceFilters) => setTopFilter(filterValue);

  const viewNewPage = (newSkip: number) => {
    setComplianceLogFetching(true);
    setSkip(newSkip);
    setShowFromCount(newSkip + 1);
  };

  const goNextPage = () => {
    const newSkip = skip + (limitStep! || defaultLimitStep);

    if (newSkip > total) return;

    viewNewPage(newSkip);
  };

  const goPrevPage = () => {
    const newSkip = skip - (limitStep! || defaultLimitStep);

    if (newSkip < 0) return;

    viewNewPage(newSkip);
  };

  const complianceLogTableHeader = translate(complianceLogTHeader(isCompliancePage));

  const updateComplianceList = async (isExport: boolean = false) => {
    const currentFilter: Query = selectedTab.value === complianceTabs.all.value ? {} : { status: selectedTab.value   };

    if (topFilter) {
      if (topFilter.startDate) currentFilter.startDate = topFilter.startDate.toDateString();
      if (topFilter.endDate) currentFilter.endDate = topFilter.endDate.toDateString();
      if (topFilter.relatedTo) currentFilter.relatedTo = topFilter.relatedTo.id;
      if (topFilter.relatedBy) currentFilter.relatedUserId = topFilter.relatedBy.id;
      if (topFilter.action) currentFilter.actionType = topFilter.action.id;
      if (topFilter.status) currentFilter.status = topFilter.status.id;
    }
  
    if (relatedUserId) currentFilter.relatedUserId = relatedUserId;

    setFilter(currentFilter);
    setComplianceLogFetching(!isExport);

    const limitValue = isExport ? 0 : (limitStep! || defaultLimitStep);

    const query: Query = {
      skip,
      limit: limitValue,
      ...currentFilter
    };

    const requestQuery = createQueryString(query);

    await AdminService.getComplianceList(requestQuery)
      .then((res) => {
        const { data, count, totals } = res.data;

        if (isExport) {
          const dataToExport = createComplianceLogExportData(data, isCompliancePage);

          exportToXLSX(dataToExport, "compliances_log_data");
        } else {
          setTotal(count);

          setComplianceData({ logs: data });
  
          const updatedCategories: ComplianceCategories = totals?.reduce(
            (acc, curr) => {
              return {
                ...acc,
                [curr.label]: curr.count,
                all: acc.all + curr.count,
              };
            },
            initialCategories
          )!;
  
          setComplianceCategories(updatedCategories);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setComplianceLogFetching(false));
  };

  const exportResult = () => updateComplianceList(true);

  const callbackActionCompliance = () => {
    updateComplianceList();
    if (callbackAction) callbackAction();
  };

  const onOpenComplianceDetails = (complianceId: string) => {
    const compliance = compliances.find(item => item.id === complianceId);

    if (compliance) setComplianceDetails(compliance);
  };

  const onCloseComplianceDetails = () => {
    setComplianceDetails(null);
  };

  useEffect(() => {
    if (id) {
      setShowFromCount(skip + 1);
      updateComplianceList();
    }
  }, [selectedTab, skip, id]);

  useEffect(() => {
    if (topFilter) {
      updateComplianceList();
    }
  }, [topFilter]);

  useEffect(() => {
    setComplianceLogRows(createComplianceLogRows(id, compliances, onOpenComplianceDetails, isCompliancePage));
  }, [compliances, i18n.language]);

  return {
    t,
    withTitle,
    isCompliancePage,
    isPagination,
    complianceLogRows,
    isComplianceLogFetching,
    complianceLogTableHeader,
    onCloseRejectForm,
    filter,
    skip,
    total,
    goNextPage,
    goPrevPage,
    onTabChange,
    setShowFilters,
    updatePageByFilter,
    exportResult,
    selectedTab,
    complianceCategories,
    showFromCount,
    showFilters,
    showRejectForm: Boolean(rejectLogId),
    limitStep : limitStep || defaultLimitStep,
    complianceDetails,
    onCloseComplianceDetails,
    callbackActionCompliance
  };
};

export { useComplianceLog };
