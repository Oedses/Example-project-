import { useEffect, ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductFilters, PaymentType } from "../../../../../../shared/types/product";
import { Issuer } from "../../../../../../shared/types/issuer";
import { defaultValues } from "./product-filters.constants";
import { Option } from '../../../components/UI/Select';
import IssuerService from "../../../../services/IssuerService";
import { Query } from "../../../../../../shared/types/response";
import { createQueryString, isSuperUser } from "../../../../utils/fn";
import UserContext from '../../../../store/contexts/user-context';

export type ProductFiltersProps = {
  visible?: boolean;
  updatePageByFilter?: (value: ProductFilters) => void;
};

function useProductFilters({ visible = false, updatePageByFilter }: ProductFiltersProps) {
  const [values, setValues] = useState<ProductFilters>(defaultValues);
  const [isFetching, setIsFetching] = useState(false);
  const [issuerOptions, setIssuerOptions] = useState<Option[]>([]);
  const [paymentTypeOptions, setPaymentTypeOptions] = useState<Option[]>([]);
  const { data: { role } } = UserContext.useContext();

  const { t } = useTranslation();
  const tPath = 'components.table.products';

  const onFilterPaymentTypeChange = (option: Option) => {
    setValues({
      ...values,
      paymentType: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterIssuerChange = (option: Option) => {
    setValues({
      ...values,
      issuer: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterCouponRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;

    if (name === 'start') {
      setValues({ ...values, startCouponRate: value ? Number(value) : undefined });
    } else {
      setValues({ ...values, endCouponRate: value ? Number(value) : undefined });
    }
    
  };

  const setFiltersPaymentType = () => {
    let paymentType = Object.values(PaymentType).map((value: string) => {
      return {
        value: value,
        label: t(`${tPath}.type.${value.toLowerCase()}`)
      };
    });

    setPaymentTypeOptions(paymentType);
  };

  const setFiltersIssuers = () => {
    const query: Query = {
      skip: 0,
      limit: 0
    };

    IssuerService.getList(createQueryString(query))
      .then((res) => {
        const issuers: Option[] = res.data.data.map((item: Issuer) => {
          const value = {
            value: item.id as string,
            label: item.name
          };
          return value;
        });
        setIssuerOptions(issuers);
      })
      .finally(() => setIsFetching(false));
  };

  const onClearFilters = () => {
    setValues(defaultValues);
    if (typeof updatePageByFilter === 'function') {
      updatePageByFilter(defaultValues);
    }
  };

  useEffect(() => {
    setIsFetching(true);
    setFiltersPaymentType();
    if (isSuperUser(role)) {
      setFiltersIssuers();
    } else {
      setIsFetching(false);
    }
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
    isFetching,
    paymentTypeOptions,
    issuerOptions,
    onFilterPaymentTypeChange,
    onFilterCouponRateChange,
    onFilterIssuerChange,
    onClearFilters
  };
}

export { useProductFilters };
