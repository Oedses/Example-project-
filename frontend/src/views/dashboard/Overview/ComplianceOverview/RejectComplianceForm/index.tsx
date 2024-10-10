import { hoc } from '../../../../../utils';

import { CheckMarkIcon } from '../../../../components/icons';
import { Button, Input } from '../../../../components/UI';
import { ButtonView } from '../../../../components/UI/Button/button.props';
import { Spinner } from '../../../../components/UI/Spinner';

import { useRejectComplianceForm } from './reject-compliance-form.hook';

const RejectComplianceForm = hoc(useRejectComplianceForm, ({
  t,
  reasonRef,
  isFetching,
  onSubmit,
  reasonError,
  onReasonChange
}) => (
  <section className="form-wrapper">
    <div className="form-container form-container_signup">
      <div className="form">
        <h2 className="form__heading">
          {t('pages.complianceLog.rejectForm.title')}
        </h2>

        <div className="form__description-wrapper">
          <p className="form__text">
            {t('pages.complianceLog.rejectForm.subtitle')}
          </p>
        </div>

        <div className="form__inputs-wrapper">
          <Input
            isControlled={false}
            label={t('pages.complianceLog.rejectForm.placeholder')}
            name='reason'
            inputProps={{
              ref: reasonRef,
              defaultValue: '',
              placeholder: t('pages.complianceLog.rejectForm.placeholder'),
              disabled: isFetching,
              onChange: onReasonChange
            }}
            disabled={isFetching}
            errorMessage={reasonError}
          />
        </div>

        <section>
          {isFetching ? (
            <Spinner />
          ) : (
          <Button
            view={ButtonView.green}
            fullWidth
            onClick={onSubmit}
            disabled={isFetching}
          >
            <CheckMarkIcon width="16px" height="16px" />

            {t('pages.admin.complianceLog.submit')}
          </Button>
          )}
        </section>
      </div>
    </div>
  </section>
));

export default RejectComplianceForm;