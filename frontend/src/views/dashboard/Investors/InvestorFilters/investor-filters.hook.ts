import { useEffect, ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { InvestorFilters, InvestorType } from "../../../../../../shared/types/investor";
import { defaultValues } from "./investor-filters.constants";
import { Option } from '../../../components/UI/Select';
import { toCamelCase } from "../../../../utils";

export type InvestorFiltersProps = {
  visible?: boolean;
  updatePageByFilter?: (value: InvestorFilters) => void;
};

function useInvestorFilters({ visible = false, updatePageByFilter }: InvestorFiltersProps) {
  const [values, setValues] = useState<InvestorFilters>(defaultValues);
  const [isFetching, setIsFetching] = useState(false);
  const [entityTypeOptions, setEntityTypeOptions] = useState<Option[]>([]);

  const { t } = useTranslation();
  const tPath = 'components.table.investors';

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

  const onFilterEntityTypeChange = (option: Option) => {
    setValues({
      ...values,
      entityType: {
        id: option.value as string,
        name: option.label,
      },
    });
  };

  const onFilterTotalProductsChange = (event: ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;

    if (name === 'start') {
      setValues({ ...values, startTotalProducts: value ? Number(value) : undefined });
    } else {
      setValues({ ...values, endTotalProducts: value ? Number(value) : undefined });
    }
    
  };

  const setFiltersEntityType = () => {
    let entityType = Object.values(InvestorType).map((value: string) => {
      return {
        value: value,
        label: t(`${tPath}.type.${toCamelCase(value.toLowerCase())}`)
      };
    });

    setEntityTypeOptions(entityType);
    setIsFetching(false);
  };

  const onClearFilters = () => {
    setValues(defaultValues);
    if (typeof updatePageByFilter === 'function') {
      updatePageByFilter(defaultValues);
    }
  };

  useEffect(() => {
    setIsFetching(true);
    setFiltersEntityType();
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
    entityTypeOptions,
    onFilterStartDateChange,
    onFilterEndDateChange,
    onFilterEntityTypeChange,
    onFilterTotalProductsChange,
    onClearFilters
  };
}

export { useInvestorFilters };
