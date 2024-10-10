import { useEffect, ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { IssuerFilters } from "../../../../../../shared/types/issuer";
import { defaultValues } from "./issuer-filters.constants";

export type IssuerFiltersProps = {
  visible?: boolean;
  updatePageByFilter?: (value: IssuerFilters) => void;
};

function useIssuerFilters({ visible = false, updatePageByFilter }: IssuerFiltersProps) {
  const [values, setValues] = useState<IssuerFilters>(defaultValues);
  const [isFetching] = useState(false);

  const { t } = useTranslation();

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

  const onClearFilters = () => {
    setValues(defaultValues);
    if (typeof updatePageByFilter === 'function') {
      updatePageByFilter(defaultValues);
    }
  };

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
    onFilterStartDateChange,
    onFilterEndDateChange,
    onClearFilters
  };
}

export { useIssuerFilters };
