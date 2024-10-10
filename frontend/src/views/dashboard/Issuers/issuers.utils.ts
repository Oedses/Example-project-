import { Holding } from "../../../../../shared/types/holding";
import { Investor, isLegalEntity, isNaturalPerson } from "../../../../../shared/types/investor";
import { Product } from "../../../../../shared/types/product";

import { Option } from '../../components/UI/Select';

const createInvestorItem = (item: Investor): Option => {
  let result: Option = {
    value: item.id!,
    label: ''
  };

  if (isNaturalPerson(item)) {
    result.label = `${item.firstName} ${item.lastName}`;
  }

  if (isLegalEntity(item)) {
    result.label = item.companyName;
  }

  return result;
};

const createProductItem = (item: Product | Holding): Option => {
  return {
    value: item.id,
    label: item.name
  } as Option;
};

export {
  createInvestorItem,
  createProductItem
 };