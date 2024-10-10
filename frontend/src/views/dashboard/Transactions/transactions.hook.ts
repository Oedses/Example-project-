/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Label, Roles, Status } from "../../../../../shared/types/common";
import { Query } from "../../../../../shared/types/response";
import { CreateTransactonResponse, TransactionStatus, TransactionFilters } from "../../../../../shared/types/transaction";

import TransactionService from "../../../services/TransactionService";
import UserContext from "../../../store/contexts/user-context";
import { capitalize, createQueryString, delay, translate, exportToXLSX } from "../../../utils/fn";

import { Row } from "../../components/UI/Table";
import { getCurrentTab } from "../../components/UI/Tabs/tabs.utils";

import Validation from "./CreateTransactionForm/validation";

import { theadData, limitStep, createTransactionsRows, DetailType, createTransactionsExportData, rolesForCreate, centeredColumns } from "./transactions.constants";

type TransactionsProps = {
  isPageTransactions?: boolean;
  productId?: string;
  investorId?: string;
  issuerId?: string;
};

type TransactionsCategories = {
  [key in TransactionStatus]: number;
} & { all: number };

type TransactionsTabs = {
  [key in keyof TransactionsCategories]: Label
};

const initialCategories = Object.keys(TransactionStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [capitalize(curr)]: 0 }), {}) as TransactionsCategories;

const transactionsTabs: TransactionsTabs = {
  Processing: {
    value: 'Processing',
    label: 'Processing'
  },
  Processed: {
    value: 'Processed',
    label: 'Processed'
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

export const useTransactions = ({ isPageTransactions = true, productId, investorId, issuerId }: TransactionsProps) => {
  const { data: { role } } = UserContext.useContext();

  const transactionTableScrollRef = useRef<HTMLDivElement>(null);

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFromCount, setShowFromCount] = useState(1);

  const [tableHeader, setTableHeader] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

  const [transactions, setTransactions] = useState<CreateTransactonResponse[]>([]);
  const [selectedTab, setSelectedTab] = useState<Label>(transactionsTabs.all);
  const [transactionDetails, setTransactionDetails] = useState<CreateTransactonResponse | null>(null);
  const [topFilter, setTopFilter] = useState<TransactionFilters | null>(null);

  const [transactionRows, setTransactionRows] = useState<Row[]>([]);

  const [transactionsCategories, setTransactionsCategories] = useState<TransactionsCategories>(initialCategories);

  const { t, i18n } = useTranslation();

  const centeredTransactionsColumns = useMemo(() => role && centeredColumns[role], [role]);

  const detailType =  productId ? DetailType.PRODUCT : investorId ? DetailType.INVESTOR : issuerId ? DetailType.ISSUER : DetailType.NONE;

  const onToggleForm = () => {
    Validation.reset();
    setShowForm(!showForm);
  };

  const onTabChange = (selected: string) => {
    setSelectedTab(getCurrentTab(transactionsTabs, selected));
    setSkip(0);
  };

  const updatePageByFilter = (filterValue: TransactionFilters) => {
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

  const onOpenTransactionDetails = (transactionId: string) => {
    const transaction = transactions.find(item => item.id === transactionId);

    if (transaction) setTransactionDetails(transaction);
  };

  const onCloseTransactionDetails = () => {
    setTransactionDetails(null);
  };

  const updateTransactionsList = async (status: Label, isExport: boolean = false) => {
    setIsFetching(!isExport);

    const limitValue = isExport ? 0 : limitStep;

    const query: Query = {
      skip,
      limit: limitValue,
      ...(selectedTab.value === transactionsTabs.all.value ? {} : { status: status.value })
    };

    if (topFilter) {
      if (topFilter.startDate) query.startDate = topFilter.startDate.toDateString();
      if (topFilter.endDate) query.endDate = topFilter.endDate.toDateString();
      if (topFilter.product) query.product = topFilter.product.id;
      if (topFilter.type) query.type = topFilter.type.id;
      if (topFilter.investor) query.investor = topFilter.investor.id;
      if (topFilter.status) query.status = topFilter.status.id;
    }

    if (productId) query.product = productId;
    if (investorId) query.investor = investorId;
    if (issuerId) query.issuer = issuerId;

    await TransactionService.getList(createQueryString(query))
    .then((res) => {
      const { data, count, totals } = res.data;

      if (isExport) {
        const dataToExport = createTransactionsExportData(data, role, isPageTransactions, detailType);

        exportToXLSX(dataToExport, "transactions_data");
      } else {
        const rows: Row[] = createTransactionsRows(data, role, onOpenTransactionDetails, isPageTransactions, detailType);

        setTransactions(data);
        setTransactionRows(rows);

        const totalTransactions = totals?.reduce((acc, curr) => acc + curr.count, 0)!;

        setTotal(count);

        const updatedCategories = totals?.reduce(
          (acc, curr) => {
            return {
              ...acc,
              [curr.label as TransactionStatus]: curr.count,
              all: totalTransactions
            };
          }, initialCategories
        )!;

        setTransactionsCategories(updatedCategories);
      }
    })
    .finally(() => setIsFetching(false));
  };

  const exportResult = () => updateTransactionsList(selectedTab, true);

  useEffect(() => setTableHeader(translate(theadData(role, isPageTransactions, detailType))), [role, i18n.language]);

  useEffect(() => {
    if (!showForm && role) {
      setSelectedTab(transactionsTabs.all);
    }
  }, [showForm]);

  useEffect(() => {
    if (topFilter) {
      updateTransactionsList(selectedTab);
    }
  }, [topFilter]);

  useEffect(() => {
    if (!showForm && role) {
      if (selectedTab.value === transactionsTabs.all.value) {
        setShowFromCount(skip + 1);
        updateTransactionsList(transactionsTabs.all);
        return;
      }

      updateTransactionsList(selectedTab);

      setShowFromCount(1);
    }
  }, [selectedTab, skip, role]);

  useEffect(() => {
    setTransactionRows(createTransactionsRows(transactions, role, onOpenTransactionDetails, isPageTransactions, detailType));
  }, [transactions, i18n.language]);

  return {
    t,
    tableHead: tableHeader,
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
    isCreateAllowed: rolesForCreate.includes(role),
    centeredTransactionsColumns,
    transactionTableScrollRef,
    role,
    isPageTransactions,
    transactionDetails,
    onCloseTransactionDetails
  };
};
