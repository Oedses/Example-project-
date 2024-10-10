import React, { DetailedHTMLProps, InputHTMLAttributes, useMemo } from 'react';

import NumberFormat, {
  NumberFormatValues,
  NumberFormatPropsBase
} from 'react-number-format';

import classNames from 'classnames';
import { InputProps } from './input.props';
import './input.scss';

const Input = ({
  label,
  errorMessage,
  name,
  onMaskedValueChange,
  className,
  icon,
  maxLength,
  isWithMask,
  disabled,
  inputProps,
  inputProps: { value, placeholder },
  tipText,
  isFloatValue = true,
  isControlled = true,
  type = 'text'
}: InputProps) => {
  const classes = classNames('input', className, {
    'input_padding-left': icon,
    'input_with-label': label,
  });

  const inputClasses = classNames('input__control', {
    'input__control-with-error': Boolean(errorMessage),
    [inputProps.className!] : Boolean(inputProps.className)
  });

  const defaultProps: Pick<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'className' | 'id' | 'placeholder' | 'maxLength' | 'disabled'
  > = useMemo(() => ({
    className: 'input__control',
    ...(isControlled ? { value: value ? (value as string | number) : '' } : {}),
    id: label || placeholder,
    placeholder: placeholder || label,
    maxLength: maxLength || 50,
    disabled
  }), [value, disabled, placeholder]);

  const defaultInputProps: Partial<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  > = {
    ...defaultProps,
    type,
    name,
    className: inputClasses,
    ...inputProps,
  };

  if (isWithMask && onMaskedValueChange) {
    const maskedInputProps: Partial<typeof defaultProps> &
      Partial<NumberFormatPropsBase<any>> = {
      disabled,
      ...defaultProps,
      thousandSeparator: '.',
      decimalSeparator: ',',
      allowedDecimalSeparators: [','],
      allowLeadingZeros: false,
      decimalScale: isFloatValue ? 2 : 0,
      fixedDecimalScale: true,
      isNumericString: true,
      onValueChange: (values: NumberFormatValues) => onMaskedValueChange(name, values.value)
    };

    return (
      <div className={classes}>
        {label && (
          <label className="label" htmlFor={label}>
            {label}
          </label>
        )}
        {icon && <div className="input__icon-wrapper">{icon}</div>}
        <NumberFormat {...maskedInputProps} className={inputClasses} />

        {tipText && !errorMessage && <span className="input__info">{tipText}</span>}
        {errorMessage && <span className="input__error">{errorMessage}</span>}
      </div>
    );
  }

  return (
    <div className={classes}>
      {label && (
        <label className="label" htmlFor={label}>
          {label}
        </label>
      )}
      {icon && <div className="input__icon-wrapper">{icon}</div>}

      <input {...defaultInputProps} className={inputClasses} />

      {tipText && !errorMessage && <span className="input__info">{tipText}</span>}
      {errorMessage && <span className="input__error">{errorMessage}</span>}
    </div>
  );
};

export default Input;
