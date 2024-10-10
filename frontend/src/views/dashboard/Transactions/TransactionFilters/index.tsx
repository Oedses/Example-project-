import React from 'react';

import './transaction-filters.scss';
import { RefreshIcon } from "../../../components/icons";
import { DatePicker, Select, Button } from '../../../components/UI';
import { ButtonView } from "../../../components/UI/Button/button.props";
import { hoc } from '../../../../utils';
import { useTransactionFilters } from './transaction-filters.hook';

const TransactionFilters = hoc(
  useTransactionFilters,
  ({
    t,
    values,
    visible,
    isMainFilter,
    availableInvestor,
    availableProduct,
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
  }) => {
    if (!visible) return null;

    return (
      <section className='transaction-filters'>
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
            options={typeOptions}
            onChange={onFilterTransactionTypeChange}
            label={t('pages.transactions.filters.transactionType')}
            placeholder={t(
              'pages.admin.overview.complianceLog.any'
            )}
            value={{
              label: values.type?.name || '',
              value: values.type?.id || '',
            }}
            disabled={isFetching}
          />
        </div>
        {availableInvestor && (
          <div className='select-container'>
            <Select
              options={investorOptions}
              onChange={onFilterInvestorChange}
              label={t('pages.transactions.filters.investor')}
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
              value={{
                label: values.investor?.name || '',
                value: values.investor?.id || '',
              }}
              disabled={isFetching}
            />
          </div>
        )}
        {availableProduct && (
          <div className='select-container'>
            <Select
              options={productOptions}
              onChange={onFilterProductChange}
              label={t('pages.transactions.filters.product')}
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
              value={{
                label: values.product?.name || '',
                value: values.product?.id || '',
              }}
              disabled={isFetching}
            />
          </div>
        )}
        {!isMainFilter && (
          <div className='select-container'>
            <Select
              options={statusOptions}
              onChange={onFilterStatusChange}
              label={t('pages.transactions.filters.status')}
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
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

export default TransactionFilters;