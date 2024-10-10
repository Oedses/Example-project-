import { useState, useRef, memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { ArrowDown } from '../../icons';

import './select.scss';
import { InputDefaultProps } from '../../../../../../shared/types/common';

export type Option = {
  value: string | number;
  label: string;
};

export interface SelectProps extends InputDefaultProps {
  options: Option[];
  value: Option | null;
  onChange: (v: Option) => void;
}

const Select = ({
  className,
  label,
  options,
  errorMessage,
  value,
  placeholder,
  onChange,
  disabled,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation();

  const selectRef = useRef<HTMLDivElement>(null);

  const toggling = () => {
    if (isOpen && value?.value) onChange({ label: '', value: '' });
    if (!disabled) setIsOpen(!isOpen);
  };
  const open = () => !disabled && setIsOpen(true);

  const isOptionActive = (option: Option) => {
    if (!value) return false;

    return option.value === value.value;
  };

  const onOptionClicked = (selectedOption: Option) => {
    setIsOpen(false);

    if (!isOptionActive(selectedOption)) onChange(selectedOption);
  };

  // const onClick = (e: MouseEvent) => {
  //   if (disabled) return;

  //   if (selectRef.current && !selectRef.current.contains(e.target as Node) &&
  //     (e.target as Node).nodeName !== 'svg' &&
  //     (e.target as Node).nodeName !== 'path'
  //   ) {
  //     setIsOpen(false);
  //   }
  // };
  const handleClickOutside = (event: any) => {
  
    if (selectRef && !selectRef?.current?.contains(event.target)) setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  const selectWrapperClasses = classNames('select', className, {
    select_opened: isOpen
  });

  const selectedOptionClasses = classNames('select__selected-option', {
    'select__selected-option_placeholder': isOpen || !value?.label && placeholder,
    select_disabled: disabled
  });


  const selectContainerClasses = classNames("select__container", {
    "select__container-with-error": errorMessage
  });

  const liClasses = (option: Option) => classNames('select__option', {
    'select__option-active': isOptionActive(option)
  });

  return (
    <div className={selectWrapperClasses}>
      {label && <label className="label">{label}</label>}

      <div className={selectContainerClasses} ref={selectRef}>
        <div className={selectedOptionClasses} onClick={toggling}>
          {!isOpen && value?.label ? value?.label : placeholder}
          {!isOpen && <ArrowDown width="16px" height="16px" onClick={open} />}
        </div>

        {isOpen && (
          <div className="select__list-container">
            {options?.length ? (
              <ul className="select__list">
                {options.map((option, index) => (
                  <li
                    className={liClasses(option)}
                    onClick={() => onOptionClicked(option)}
                    key={index}
                  >
                    <p>
                      {option.label}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('components.select.empty')}</p>
            )}
          </div>
        )}
      </div>

      {errorMessage && <span className="select__error">{errorMessage}</span>}
    </div>
  );
};

export default memo(Select);
