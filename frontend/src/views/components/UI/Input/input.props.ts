import { ComponentProps, ReactNode } from 'react';
import { InputDefaultProps } from '../../../../../../shared/types/common';

export interface InputProps extends InputDefaultProps {
  inputProps: ComponentProps<'input'>;
  validate?: () => void;
  isControlled?: boolean;
  type?: string;
  name?: string;
  icon?: ReactNode;
  maxLength?: number;
  isWithMask?: boolean;
  isFloatValue?: boolean;
  onMaskedValueChange?: (
    name: string | undefined,
    value: string | number
  ) => void;
  tipText?: string;
}
