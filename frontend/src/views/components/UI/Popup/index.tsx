import React from 'react';

import { Button } from '..';

import { hoc } from '../../../../utils';

import { CloseIcon } from '../../icons';
import { ButtonView } from '../Button/button.props';

import { usePopup } from './popup.hook';
import './popup.scss';


const Popup = hoc(usePopup, ({ onClose, children, visible, overlayRef, isClosable = true }) => {
  if (!visible) return null;

  return (
    <div className="popup">
      <div className="popup__overlay" ref={isClosable ? overlayRef : null}></div>
      <div className="popup__content">
        {children}

        {onClose && isClosable && (
          <Button
            className="popup__close-button"
            view={ButtonView.unfilled}
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
        )}
      </div>
    </div>
  );
});

export default Popup;

