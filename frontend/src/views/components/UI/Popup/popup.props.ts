import { ReactNode } from 'react';

export interface PopupForm {
  visible?: boolean;
  onClose?: () => void;
}

export interface PopupProps extends PopupForm {
  children: ReactNode | ReactNode[];
  isClosable: boolean;
}
