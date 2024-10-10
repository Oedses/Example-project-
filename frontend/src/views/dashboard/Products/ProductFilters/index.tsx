import './product-filters.scss';
import { RefreshIcon } from "../../../components/icons";
import { Select, Button, Input } from '../../../components/UI';
import { ButtonView } from "../../../components/UI/Button/button.props";
import { hoc, isSuperUser } from '../../../../utils';
import { useProductFilters } from './product-filters.hook';
import UserContext from '../../../../store/contexts/user-context';

const ProductFilters = hoc(
  useProductFilters,
  ({
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
  }) => {
    const { data: { role } } = UserContext.useContext();

    if (!visible) return null;

    return (
      <section className='product-filters'>
        {(isSuperUser(role)) && (
          <div className='select-container'>
            <Select
              options={issuerOptions}
              onChange={onFilterIssuerChange}
              label={t('pages.products.filters.issuer')}
              placeholder={t(
                'pages.admin.overview.complianceLog.any'
              )}
              value={{
                label: values.issuer?.name || '',
                value: values.issuer?.id || '',
              }}
              disabled={isFetching}
            />
          </div>
        )}
        
        <div className='select-container'>
          <Select
            options={paymentTypeOptions}
            onChange={onFilterPaymentTypeChange}
            label={t('pages.products.filters.paymentType')}
            placeholder={t(
              'pages.admin.overview.complianceLog.any'
            )}
            value={{
              label: values.paymentType?.name || '',
              value: values.paymentType?.id || '',
            }}
            disabled={isFetching}
          />
        </div>
        <div className='input-container'>
          <Input
            className='coupon-rate'
            label={t('pages.products.filters.startCouponRate')}
            name='start'
            inputProps={{
              value: values.startCouponRate || (values.startCouponRate === 0 ? 0 : ''),
              placeholder: t('pages.admin.overview.complianceLog.any'),
              onChange: onFilterCouponRateChange,
              disabled: isFetching,
              type: 'number',
              min: 0,
            }}
          />
        </div>
        <div className='input-container'>
          <Input
            className='coupon-rate'
            label={t('pages.products.filters.endCouponRate')}
            name='end'
            inputProps={{
              value: values.endCouponRate || (values.endCouponRate === 0 ? 0 : ''),
              placeholder: t('pages.admin.overview.complianceLog.any'),
              onChange: onFilterCouponRateChange,
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

export default ProductFilters;