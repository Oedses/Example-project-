import React from 'react';

import './issuer-filters.scss';
import { RefreshIcon } from "../../../components/icons";
import { DatePicker, Button } from '../../../components/UI';
import { ButtonView } from "../../../components/UI/Button/button.props";
import { hoc } from '../../../../utils';
import { useIssuerFilters } from './issuer-filters.hook';

const IsserFilters = hoc(
  useIssuerFilters,
  ({
    t,
    values,
    visible,
    isFetching,
    onFilterStartDateChange,
    onFilterEndDateChange,
    onClearFilters
  }) => {
    if (!visible) return null;

    return (
      <section className='issuer-filters'>
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

export default IsserFilters;