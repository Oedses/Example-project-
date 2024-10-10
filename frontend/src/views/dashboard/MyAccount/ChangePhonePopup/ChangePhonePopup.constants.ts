import { ChangePhoneRequest } from "../../../../../../shared/types/user";

export const maxPhoneLength = 15;

export const defaultValues: ChangePhoneRequest = {
  phone: '',
};

export type VerifyPhoneFields = {
  phone: string
};

export const defaultErrors: VerifyPhoneFields = {
  phone: '',
};
