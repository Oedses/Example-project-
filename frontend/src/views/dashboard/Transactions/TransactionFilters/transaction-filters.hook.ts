import { useEffect, ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransactionFilters, TransactionStatus, TransactionType, PaymentType, TransactionFiltersProducts, TransactionFiltersInvestors } from "../../../../../../shared/types/transaction";
import UserContext from "../../../../store/contexts/user-context";
import { defaultValues } from "./transaction-filters.constants";
import { Option } from '../../../components/UI/Select';
import TransactionService from "../../../../services/TransactionService";
import { DetailType } from "../transactions.constants";
import { getDisplayName, isSuperUser } from "../../../../utils/fn";

export type TransactionFiltersProps = {
  visible?: boolean;
  detailType?: DetailType;
  isMainFilter?: boolean;
  updatePageByFilter?: (value: TransactionFilters) => void;
};

function useTransactionFilters({ visible = false, isMainFilter = true, detailType = DetailType.NONE, updatePageByFilter }: TransactionFiltersProps) {
  const [values, setValues] = useState<TransactionFilters>(defaultValues);
  const [isFetching, setIsFetching] = useState(false);
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);
  const [investorOptions, setInvestorOptions] = useState<Option[]>([]);

  const { data: { role } } = UserContext.useContext();

  const availableInvestor =  isSuperUser(role) && detailType !== DetailType.INVESTOR;
  const availableProduct = isMainFilter || (!isMainFilter && detailType !== DetailType.PRODUCT && detailType !== DetailType.NONE);

  const { t } = useTranslation();
  const tPath = 'components.table.transactions';

  const onFiterDateChange = (event: ChangeEvent<HTMLInputElement>, isFrom: boolean = true) => {
    const oldFilterDate = isFrom ? values.startDate : values.endDate;
    if (event.target.value) {
      const newDate = new Date(event.target.value);
      const newDateTime = newDate?.getTime();
      const oldDateTime = oldFilterDate?.getTime();
      if (newDateTime != oldDateTime) {
        if (isFrom)
          setValues({ ...values, startDate: newDate });

        else
          setValues({ ...values, endDate: newDate });
      }
    } else {
      if (oldFilterDate) {
        if (isFrom)
          setValues({ ...values, startDate: undefined });

        else
          setValues({ ...values, endDate: undefined });
      }
    }
  };

  const onFilterStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiterDateChange(event);
  };

  const onFilterEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiterDateChange(event, false);
  };

  const onFilterTransactionTypeChange = (option: Option) => {
    setValues({
      ...values,
      type: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterInvestorChange = (option: Option) => {
    setValues({
      ...values,
      investor: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterProductChange = (option: Option) => {
    setValues({
      ...values,
      product: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterStatusChange = (option: Option) => setValues(prev => (
    {
      ...prev,
      status: {
        id: option.value as string,
        name: option.label,
      }
    }
  ));

  const setTransactionFiltersType = () => {
    let transactionType = Object.values(TransactionType).map((value: string) => {
      return {
        value: value,
        label: t(`${tPath}.type.${value.toLowerCase()}`)
      };
    });

    setTypeOptions(transactionType);
    const paymentType = Object.values(PaymentType).map((value: string) => {
      return {
        value: value,
        label: t(`${tPath}.type.${value.toLowerCase()}`)
      };
    });

    transactionType = [...transactionType, ...paymentType];
  
    setTypeOptions(transactionType);
  };

  const setStatusFiltersType = () => {
    let statusType = Object.values(TransactionStatus).map((value: string) => ({
        value: value,
        label: t(`pages.transactions.transactionsCategory.${value.toLowerCase()}`)
    }));

    setStatusOptions(statusType);
  };

  const setComplianceFiltersData = async () => {
    setIsFetching(true);
    setTransactionFiltersType();
    setStatusFiltersType();
    await TransactionService.getFiltersData()
      .then((res) => {
        const productOption: Option[] = res.data.products.map((item: TransactionFiltersProducts) => ({
          value: item.id,
          label: item.name
        }));

        setProductOptions(productOption);

        const invesotrOption: Option[] = res.data.investors.map((item: TransactionFiltersInvestors) => ({
          value: item.id,
          label: getDisplayName(item)
        }));
  
        setInvestorOptions(invesotrOption);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsFetching(false));
  };

  const onClearFilters = () => {
    setValues(defaultValues);
    if (typeof updatePageByFilter === 'function') {
      updatePageByFilter(defaultValues);
    }
  };

  useEffect(() => {
    setComplianceFiltersData();
  }, []);

  useEffect(() => {
    if (typeof updatePageByFilter === 'function' && values !== defaultValues) {
      updatePageByFilter(values);
    }
  }, [values]);

  return {
    t,
    values,
    visible,
    availableInvestor,
    availableProduct,
    isMainFilter,
    isFetching,
    typeOptions,
    productOptions,
    statusOptions,
    investorOptions,
    onFilterInvestorChange,
    onFilterStatusChange,
    onFilterStartDateChange,
    onFilterEndDateChange,
    onFilterTransactionTypeChange,
    onFilterProductChange,
    onClearFilters
  };
}

export { useTransactionFilters };
