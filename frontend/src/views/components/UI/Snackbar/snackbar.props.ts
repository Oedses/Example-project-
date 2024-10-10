import { ComponentProps } from 'react';

export type SnackbarProps = {
  message: string;
  isActive: boolean;
} & ComponentProps<'div'>;
