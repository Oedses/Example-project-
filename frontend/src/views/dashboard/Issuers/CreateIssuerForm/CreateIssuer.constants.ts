import { Issuer } from "../../../../../../shared/types/issuer";

export const defaultValues: Partial<Issuer> = {
  name: '',
  email: '',
  phone: '',
  kvk: '',
  vat: '',
  address: '',
  postcode: '',
  city: ''
};

export type createIssuerValidationFields = {
  name: string,
  email: string,
  phone: string,
  kvk: string,
  vat: string,
  address: string,
  postcode: string,
  city: string
};

export const defaultErrors: createIssuerValidationFields = {
  name: '',
  email: '',
  phone: '',
  kvk: '',
  vat: '',
  address: '',
  postcode: '',
  city: ''
};

export const onlyNumbersInputs = ['kvk'];

export const maxVATLength = 11;
export const maxKVKLength = 8;
export const maxPhoneLength = 15;
