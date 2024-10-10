import { CreateTransactionFormValues, TransactionType } from "../../../../../../../shared/types/transaction";

export type createTransactionValidationFields = {
  type: string;
  product: string;
  investor: string;
  ticketSize: string,
  quantity: string,
  receiver: string;
};

export const defaultErrors: createTransactionValidationFields = {
  type: '',
  product: '',
  investor: '',
  ticketSize: '',
  quantity: '',
  receiver: ''
};

export const defaultValues: CreateTransactionFormValues = {
  type: TransactionType.BUY,
  product: {
    id: '',
    name: '',
  },
  investor: {
    id: '',
    name: ''
  },
  quantity: 1,
  receiver: {
    id: '',
    name: ''
  }
};

export const maxLengthAmount = 16;