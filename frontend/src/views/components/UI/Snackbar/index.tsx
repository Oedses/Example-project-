import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

import { SnackbarProps } from './snackbar.props';
import './snackbar.scss';

import { CloseIcon, InfoIcon } from '../../icons';
import { capitalize, decryptCamelCase } from '../../../../utils/fn';

const Snackbar: FC<SnackbarProps> = ({ message, isActive, className }) => {
  const [isOpened, setIsOpened] = useState(false);

  const classes = classNames('snackbar', className, {
    snackbar_show: isOpened
  });

  const onClose = () => {
    setIsOpened(false);
  };


  useEffect(() => {
    setIsOpened(isActive);
  }, [isActive]);

  const getMessageText = (msg: string) => {
    if (!isOpened) return;

    if (window.location.pathname === '/signup') return msg;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, field, errorMessage] = msg.split('"');

    if (field === 'Transaction Amount') return errorMessage;


    if (!field) return msg;

    const errorField = capitalize(decryptCamelCase(field));

    return `\"${errorField}\" ${errorMessage}`;
  };

  return (
    <section className={classes}>
      <div className="snackbar__content">
        <div className="snackbar__info-icon">
          <InfoIcon />
        </div>

        <span>{getMessageText(message)}</span>

        <button className="snackbar__close-icon" onClick={onClose}>
          <CloseIcon width='12' height='12' />
        </button>
      </div>
    </section>
  );
};

export default Snackbar;
