import { useEffect, ChangeEvent, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AdminService from "../../../../services/AdminService";
import {
  ComplianceFilters,
  ComplianceFiltersActionType
} from "../../../../../../shared/types/compliance";
import { ComplianceStatus } from "../../../../../../shared/types/common";
import { Option } from '../../../components/UI/Select';
import { defaultValues, tPath, placeHolderText } from "./compliance-filters.constants";
import { getDisplayName } from "../../../../utils/fn";

export type ComplianceFiltersProps = {
  visible?: boolean;
  isMainFilter?: boolean;
  updatePageByFilter?: (value: ComplianceFilters) => void;
};

const useComplianceFilters = ({ visible = false, isMainFilter = true, updatePageByFilter }: ComplianceFiltersProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [values, setValues] = useState<ComplianceFilters>(defaultValues);
  const [relatedToOptions, setRelatedToOptions] = useState<Option[]>([]);
  const [relatedByOptions, setRelatedByOptions] = useState<Option[]>([]);
  const [actionOptions, setActionOptions] = useState<Option[]>([]);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);

  const { t, i18n } = useTranslation();

  const placeHolderLabel = useMemo(() => t(placeHolderText), [i18n.language]);

  const onFiterDateChange = (event: ChangeEvent<HTMLInputElement>, isFrom: boolean = true) => {
    const { value } = event.target;
    const oldFilterDate = isFrom ? values.startDate : values.endDate;

    if (value) {
      const newDate = new Date(value);
      const newDateTime = newDate?.getTime();
      const oldDateTime = oldFilterDate?.getTime();
      if (newDateTime !== oldDateTime) setValues(prev => ({ ...prev, [isFrom ? 'startDate' : 'endDate']: newDate }));
    } else {

      if (oldFilterDate) setValues(prev => ({ ...prev, [isFrom ? 'startDate' : 'endDate']: undefined }));
    }
  };

  const onFilterStartDateChange = (event: ChangeEvent<HTMLInputElement>) => onFiterDateChange(event);

  const onFilterEndDateChange = (event: ChangeEvent<HTMLInputElement>) => onFiterDateChange(event, false);

  const onFilterRelatedByChange = (option: Option) => setValues(prev => (
    {
      ...prev,
      relatedBy: {
        id: option.value as string,
        name: option.label,
      }
    }
  ));

  const onFilterRelatedToChange = (option: Option) => setValues(prev => (
    {
      ...prev,
      relatedTo: {
        id: option.value as string,
        name: option.label,
      }
    }
  ));

  const onFilterActionChange = (option: Option) => setValues(prev => (
    {
      ...prev,
      action: {
        id: option.value as string,
        name: option.label,
      }
    }
  ));

  const onFilterStatusChange = (option: Option) => setValues(prev => (
    {
      ...prev,
      status: {
        id: option.value as string,
        name: option.label,
      }
    }
  ));

  const setCompilanceFiltersActionType = () => {
    const actionType = Object.keys(ComplianceFiltersActionType).map((key: string) => ({
      value: ComplianceFiltersActionType[key as keyof typeof ComplianceFiltersActionType],
      label: t(`${tPath}.action.${key}`)
    }));

    setActionOptions(actionType);
  };

  const setStatusFiltersType = () => {
    let statusType = Object.values(ComplianceStatus).map((value: string) => ({
        value: value,
        label: t(`pages.admin.overview.complianceLog.complianceStatus.${value.toLowerCase()}`)
    }));

    setStatusOptions(statusType);
  };

  const setComplianceFiltersData = async () => {
    setIsFetching(true);
    setCompilanceFiltersActionType();
    setStatusFiltersType();
  
    await AdminService.getComplianceFiltersData()
      .then((res) => {
        const relatedBy: Option[] = res.data.relatedBy.map((item) => ({
          value: item.id,
          label: getDisplayName(item)
        }));
        
        const relatedTo: Option[] = res.data.relatedTo.map((item) => ({
          value: item.id,
          label: item.name
        }));

        setRelatedByOptions(relatedBy);
        setRelatedToOptions(relatedTo);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsFetching(false));
  };

  const onClearFilters = () => {
    setValues(defaultValues);
    if (updatePageByFilter) updatePageByFilter(defaultValues);
  };

  useEffect(() => {
    setComplianceFiltersData();
  }, []);

  useEffect(() => {
    if (updatePageByFilter && values !== defaultValues) {
      updatePageByFilter(values);
    }
  }, [values]);

  return {
    t,
    values,
    visible,
    isMainFilter,
    isFetching,
    relatedByOptions,
    relatedToOptions,
    actionOptions,
    placeHolderLabel,
    statusOptions,
    onFilterStatusChange,
    onFilterStartDateChange,
    onFilterEndDateChange,
    onFilterRelatedByChange,
    onFilterRelatedToChange,
    onFilterActionChange,
    onClearFilters
  };
};

export { useComplianceFilters };
