import { ComponentProps } from 'react';

export type RadioProps = {
  name?: string;
  items: { value: string; label: string }[];
  value?: string | null;
  label?: string;
  className?: string;
  inputProps?: ComponentProps<'input'>;
};
