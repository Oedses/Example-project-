import { Investor, InvestorType } from "../../../../../../shared/types/investor";

export const defaultValues: Investor = {
  type: InvestorType.NATURAL_PERSON,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bsn: '',
  address: '',
  postcode: '',
  city: '',
  kvk: '',
  companyName: ''
};

export type signUpValidationFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bsn: string;
  address: string;
  postcode: string;
  city: string;
  kvk: string;
  companyName: string;
};

export const defaultErrors: signUpValidationFields = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bsn: '',
  address: '',
  postcode: '',
  city: '',
  kvk: '',
  companyName: ''
};

export const onlyNumbersInputs = ['kvk', 'bsn'];

export const maxBSNLength = 9;
export const maxKVKLength = 8;
export const maxPhoneLength = 15;
