import React, { VFC } from 'react';
import { useTranslation } from 'react-i18next';

import { SubmitedIcon, FailIcon } from '../../components/icons';
import { Button, Popup } from '../../components/UI';

import SummaryContext from '../../../store/contexts/summary-context';
import { ButtonView } from '../../components/UI/Button/button.props';

const Summary: VFC = () => {

  const { data: {
    isShown,
    isSuccess,
    title,
    subtitle,
    closeButtonText,
    onCloseCallback
   }, setData: setSummaryData } = SummaryContext.useContext();

   const onClose = () => {
    if (onCloseCallback) onCloseCallback();
    setSummaryData({ isShown: false });
   };

  const { t } = useTranslation();

  return isShown ? (
    <Popup visible={isShown} onClose={onClose} isClosable={isSuccess}>
      <div className="form-container">
        <div className="form form_summary">
          {isSuccess ? (
            <SubmitedIcon width={'96px'} height={'96px'} />
          ) : (
            <FailIcon width={'96px'} height={'96px'} />
          )}

          <h2 className="form__heading">{t(title)}</h2>

          <p className="form__text">{t(subtitle)}</p>

          <Button
            view={ButtonView.unfilled}
            onClick={onClose}
          >
            {t(closeButtonText || 'Close')}
          </Button>
        </div>
      </div>
    </Popup>
  ) : null;
};

export { Summary };
