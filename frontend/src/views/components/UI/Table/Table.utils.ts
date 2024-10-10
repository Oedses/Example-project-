import { useMemo, useState } from "react";

import { Row } from ".";
import { DateUtils } from "../DatePicker/datepicker.utils";

export enum SortingDirection {
  ascending = 'ascending',
  descending = 'descending',
  default = 'sort-default'
}

export type SortConfig = {
  direction: SortingDirection;
  index: number;
} | null;

const useSortedTable = (items: Row[], config: SortConfig = null) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(config);

  const check = (current: number | string, next: number | string): number => {
    const isAscending = sortConfig?.direction === SortingDirection.ascending;

    if (typeof current === "string" && typeof next === "string") {
      const compare = current.localeCompare(next);

      if (compare === 1) {
        return isAscending ? -1 : 1;
      }

      if (compare === -1) {
        return isAscending ? 1 : -1;
      }

      return 0;
    }

    if (current < next) {
      return isAscending ? -1 : 1;
    }

    if (current > next) {
      return isAscending ? 1 : -1;
    }

    return 0;
  };

  const sort = (current: Row, next: Row): number => {
    const index = sortConfig?.index;

    let currentValue = current[index!]?.value;

    let nextValue = next[index!]?.value;

    if (currentValue?.toString()?.split("-")?.length === 3) {
      const currentDate = DateUtils.stringToDate(currentValue).getTime();
      const nextDate = DateUtils.stringToDate(next[index!]?.value).getTime();

      return check(currentDate, nextDate);
    }

    if (currentValue === "< 0.01") {
      currentValue = "0.009";
    }

    if (nextValue === "< 0.01") {
      nextValue = "0.009";
    }

    if (!isNaN(parseFloat(currentValue)) && !isNaN(parseFloat(nextValue)))
      return check(parseFloat(currentValue), parseFloat(nextValue));

    return check(currentValue, nextValue);
  };

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];

    if (!sortConfig) return;

    if (sortConfig.direction === SortingDirection.default) return sortableItems;

    sortableItems.sort((a: Row, b: Row) => sort(a, b));

    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (index: number) => {
    if (!sortConfig) return setSortConfig({ index, direction: SortingDirection.default });

    if (sortConfig.direction === SortingDirection.default) return setSortConfig({ index, direction: SortingDirection.ascending });
    if (sortConfig.direction === SortingDirection.ascending) return setSortConfig({ index, direction: SortingDirection.descending });
    if (sortConfig.direction === SortingDirection.descending) return setSortConfig({ index, direction: SortingDirection.default });
  };

  return {
    items: sortedItems,
    requestSort,
    sortConfig
  };
};

export { useSortedTable };