import classnames from 'classnames';
import { FC } from 'react';
import { InputDefaultProps } from '../../../../../../shared/types/common';
import { IconProps } from '../../icons';

import './checkbox.scss';

export interface CheckboxProps extends InputDefaultProps {
  onChange?: () => void;
  checked: boolean;
}

const Checkbox: FC<CheckboxProps> = ({ label, checked, onChange, className, disabled }) => {
  const containerClasses = classnames('checkbox__container', className, {
    checkbox__disabled: disabled,
    checkbox__checked: checked
  });

  const iconProps: IconProps = {
    className: 'checkbox__icon',
    width: "22",
    height: "22",
    viewBox: "0 0 22 22",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  };

  const onToggle = () => {
    if (disabled) return;

    if (onChange) onChange();
  };

  return (
    <label htmlFor={label} className={containerClasses} onClick={onToggle}>
      <input type="checkbox" name={label} checked={checked} disabled={disabled} />

      {checked ?
        <svg {...iconProps} >
          <path d="M19 0H3C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3V19C0 19.7956 0.31607 20.5587 0.87868 21.1213C1.44129 21.6839 2.20435 22 3 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V3C22 2.20435 21.6839 1.44129 21.1213 0.87868C20.5587 0.31607 19.7956 0 19 0ZM17.707 6.707L8.707 15.707C8.51947 15.8945 8.26516 15.9998 8 15.9998C7.73484 15.9998 7.48053 15.8945 7.293 15.707L4.293 12.707C4.11084 12.5184 4.01005 12.2658 4.01233 12.0036C4.0146 11.7414 4.11977 11.4906 4.30518 11.3052C4.49059 11.1198 4.7414 11.0146 5.0036 11.0123C5.2658 11.01 5.5184 11.1108 5.707 11.293L8 13.586L16.293 5.293C16.3852 5.19749 16.4956 5.12131 16.6176 5.0689C16.7396 5.01649 16.8708 4.9889 17.0036 4.98775C17.1364 4.9866 17.2681 5.0119 17.391 5.06218C17.5138 5.11246 17.6255 5.18671 17.7194 5.2806C17.8133 5.3745 17.8875 5.48615 17.9378 5.60905C17.9881 5.73194 18.0134 5.86362 18.0123 5.9964C18.0111 6.12918 17.9835 6.2604 17.9311 6.3824C17.8787 6.50441 17.8025 6.61475 17.707 6.707Z" fill="#0099CC" />
        </svg> :
        <svg {...iconProps} >
          <path fillRule="evenodd" clipRule="evenodd" d="M3 2C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V19C2 19.2652 2.10536 19.5196 2.29289 19.7071C2.48043 19.8946 2.73478 20 3 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V3C20 2.73478 19.8946 2.48043 19.7071 2.29289C19.5196 2.10536 19.2652 2 19 2H3ZM0.87868 0.87868C1.44129 0.31607 2.20435 0 3 0H19C19.7957 0 20.5587 0.31607 21.1213 0.87868C21.6839 1.44129 22 2.20435 22 3V19C22 19.7957 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7957 22 19 22H3C2.20435 22 1.44129 21.6839 0.87868 21.1213C0.31607 20.5587 0 19.7957 0 19V3C0 2.20435 0.31607 1.44129 0.87868 0.87868Z" fill="#808080" />
        </svg>
      }

      <span>{label}</span>
    </label>
  );
};

export { Checkbox };