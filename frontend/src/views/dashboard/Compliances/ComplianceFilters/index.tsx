import React from 'react';

import { hoc } from '../../../../utils';
import { DatePicker, Select, Button } from '../../../components/UI';
import { ButtonView } from "../../../components/UI/Button/button.props";
import { RefreshIcon } from "../../../components/icons";
import { useComplianceFilters } from './compliance-filters.hook';
import './compliance-filters.scss';

const ComplianceFilters = hoc(
  useComplianceFilters,
  ({
    t,
    values,
    visible,
    isFetching,
    isMainFilter,
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
  }) => {
    if (!visible) return null;

    return (
      <section className='compliance-filters'>
        <div className="date-container">
          <label className="label">
            {t('pages.admin.overview.complianceLog.dateFrom')}
          </label>
          <div className="component">
            <DatePicker
              className="component-datepicker"
              date={values.startDate}
              onChange={onFilterStartDateChange}
              placeholder={placeHolderLabel}
              disabled={isFetching}
              maxDate={values.endDate}
            />
          </div>
        </div>
        <div className="date-container">
          <label className="label">
            {t('pages.admin.overview.complianceLog.dateTo')}
          </label>
          <div className="component">
            <DatePicker
              className="component-datepicker"
              date={values.endDate}
              onChange={onFilterEndDateChange}
              placeholder={placeHolderLabel}
              disabled={isFetching}
              minDate={values.startDate}
            />
          </div>
        </div>
        {isMainFilter && (
          <div className='select-container'>
            <Select
              options={relatedByOptions}
              onChange={onFilterRelatedByChange}
              label={t('pages.admin.overview.complianceLog.table.head.relatedBy')}
              placeholder={placeHolderLabel}
              value={{
                label: values.relatedBy?.name || '',
                value: values.relatedBy?.id || '',
              }}
              disabled={isFetching}
            />
          </div>
        )}
        <div className='select-container'>
          <Select
            options={actionOptions}
            onChange={onFilterActionChange}
            label={t('pages.admin.overview.complianceLog.table.head.action')}
            placeholder={placeHolderLabel}
            value={{
              label: values.action?.name || '',
              value: values.action?.id || '',
            }}
            disabled={isFetching}
          />
        </div>
        <div className='select-container'>
          <Select
            options={relatedToOptions}
            onChange={onFilterRelatedToChange}
            label={t('pages.admin.overview.complianceLog.table.head.relatedTo')}
            placeholder={placeHolderLabel}
            value={{
              label: values.relatedTo?.name || '',
              value: values.relatedTo?.id || '',
            }}
            disabled={isFetching}
          />
        </div>
        {!isMainFilter && (
          <div className='select-container'>
            <Select
              options={statusOptions}
              onChange={onFilterStatusChange}
              label={t('pages.admin.overview.complianceLog.table.head.status')}
              placeholder={placeHolderLabel}
              value={{
                label: values.status?.name || '',
                value: values.status?.id || '',
              }}
              disabled={isFetching}
            />
          </div>
        )}
        <div className='button-container'>
          <Button
            view={ButtonView.unfilled}
            onClick={onClearFilters}
          >
            <RefreshIcon />
            {t('pages.admin.overview.complianceLog.clearFilters')}
          </Button>
        </div>
      </section>
    );
  }
);

export default ComplianceFilters;