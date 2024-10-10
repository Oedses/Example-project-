import { useEffect, useLayoutEffect, useRef } from 'react';
import { disableScroll, enableScroll } from '../../../../utils';

import { PopupProps } from './popup.props';

export const usePopup = ({
  onClose,
  children,
  visible,
  isClosable
}: Partial<PopupProps>) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (visible) disableScroll();
    else enableScroll();

    return () => { enableScroll(); };
  }, [visible]);

  useEffect(() => {
    if (onClose) overlayRef.current?.addEventListener('click', onClose);

    return () => {
      if (onClose) overlayRef.current?.removeEventListener('click', onClose);
    };
  });

  return { onClose, children, visible, overlayRef, isClosable };
};
