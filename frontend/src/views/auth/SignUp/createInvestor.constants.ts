import { Investor, InvestorType } from '../../../../../shared/types/investor';
import config from '../../../config';

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

export const signUpCancelUrl = `https://${config.REACT_APP_OAUTH_TENANT_NAME}.b2clogin.com/${config.REACT_APP_OAUTH_TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/authorize?p=${config.REACT_APP_OAUTH_USER_FLOW}&client_id=${config.REACT_APP_OAUTH_CLIENT_ID}&nonce=defaultNonce&redirect_uri=${process.env.REACT_APP_BASE_URL}&scope=openid&response_type=id_token&prompt=login`;
