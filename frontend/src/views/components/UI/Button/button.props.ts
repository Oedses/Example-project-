import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { Modify } from '../../../../../../shared/types/common';

export enum ButtonSize {
  middle = 'middle',
  small = 'small'
}

export enum ButtonView {
  primary = 'primary',
  green = 'green',
  redBackground = 'redBackground',
  redLayout = 'redLayout',
  ghost = 'ghost',
  link = 'link',
  unfilled = 'unfilled',
}

export type ButtonProps = Modify<DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, {
  view?: ButtonView
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e?: SubmitEvent | React.MouseEvent<HTMLElement>) => void;
  children: ReactNode | ReactNode[];
}>;
