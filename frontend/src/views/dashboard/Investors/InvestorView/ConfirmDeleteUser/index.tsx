import { hoc } from '../../../../../utils';

import { Button } from '../../../../components/UI';
import { ButtonView } from '../../../../components/UI/Button/button.props';
import { Spinner } from '../../../../components/UI/Spinner';

import { useConfirmDeleteUser } from './confirm-delete-user.hook';

const ConfirmDeleteUser = hoc(useConfirmDeleteUser, ({
  t,
  isFetching,
  onSubmit,
  email,
}) => (
  <section className="form-wrapper">
    <div className="form-container form-container_signup">
      <div className="form">
        <h2 className="form__heading">
          {t('components.deleteAccount.title')}
        </h2>

        <div className="form__description-wrapper">
          <p className="form__text">
            {t('components.deleteAccount.subtitle', { email })}
          </p>
        </div>

        <section>
          {isFetching ? (
            <Spinner />
          ) : (
          <Button
            view={ButtonView.redBackground}
            fullWidth
            onClick={onSubmit}
            disabled={isFetching}
          >
            {t('components.deleteAccount.submit')}
          </Button>
          )}
        </section>
      </div>
    </div>
  </section>
));

export default ConfirmDeleteUser;