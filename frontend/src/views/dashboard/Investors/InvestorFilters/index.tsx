import React from 'react';

import { hoc } from '../../../../utils';
import { DatePicker, Select, Button, Input } from '../../../components/UI';
import { ButtonView } from "../../../components/UI/Button/button.props";
import { RefreshIcon } from "../../../components/icons";
import { useInvestorFilters } from './investor-filters.hook';
import './investor-filters.scss';

const InvestorFilters = hoc(
  useInvestorFilters,
  ({
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
  }) => {
    if (!visible) return null;

    return (
      <section className='investor-filters'>
        <div className="date-container">
          <label className="label">
            {t('pages.admin.overview.complianceLog.dateFrom')}
          </label>
          <div className="component">
            <DatePicker
              className="component-datepicker"
              date={values.startDate}
              onChange={onFilterStartDateChange}
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
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
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
              disabled={isFetching}
              minDate={values.startDate}
            />
          </div>
        </div>
        <div className='select-container'>
          <Select
            options={entityTypeOptions}
            onChange={onFilterEntityTypeChange}
            label={t('pages.investors.filters.entityType')}
            placeholder={t(
              'pages.admin.overview.complianceLog.any'
            )}
            value={{
              label: values.entityType?.name || '',
              value: values.entityType?.id || '',
            }}
            disabled={isFetching}
          />
        </div>
        <div className='input-container'>
          <Input
            className='total-products'
            label={t('pages.investors.filters.startTotalProducts')}
            name='start'
            inputProps={{
              value: values.startTotalProducts || (values.startTotalProducts === 0 ? 0 : ''),
              placeholder: t('pages.admin.overview.complianceLog.any'),
              onChange: onFilterTotalProductsChange,
              disabled: isFetching,
              type: 'number',
              min: 0,
            }}
          />
        </div>
        <div className='input-container'>
          <Input
            className='total-products'
            label={t('pages.investors.filters.endTotalProducts')}
            name='end'
            inputProps={{
              value: values.endTotalProducts || (values.endTotalProducts === 0 ? 0 : ''),
              placeholder: t('pages.admin.overview.complianceLog.any'),
              onChange: onFilterTotalProductsChange,
              disabled: isFetching,
              type: 'number',
              min: 0,
            }}
          />
        </div>
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

export default InvestorFilters;