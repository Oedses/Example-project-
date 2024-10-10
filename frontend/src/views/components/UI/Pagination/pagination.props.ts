import { RefObject } from "react";

export type PaginationProps = {
  scrollRef?: RefObject<HTMLElement>;
  from: number;
  to: number;
  total: number;
  delta: number;
  showNext?: () => void;
  showPrev?: () => void;
  disabledPrev?: boolean;
  disabledNext?: boolean;
};
