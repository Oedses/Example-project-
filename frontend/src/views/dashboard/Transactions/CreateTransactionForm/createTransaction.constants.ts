import { Holding } from '../../../../../../shared/types/holding';
import { Product, ProductCategory } from '../../../../../../shared/types/product';
import { CreateTransactionFormValues, PaymentType, TransactionType } from '../../../../../../shared/types/transaction';
import { Investor, isNaturalPerson } from '../../../../../../shared/types/investor';
import { Row, TableCell, TableCellTypes } from '../../../components/UI/Table';
import { getInterestReceived } from '../../../../utils/fn';

export const defaultValues: CreateTransactionFormValues = {
  isReturnTokens: false,
  type: TransactionType.BUY,
  paymentType: undefined,
  product: {
    id: '',
    name: '',
    paymentFrequency: undefined
  },
  investor: {
    id: '',
    name: ''
  },
  investors: [],
  quantity: 0,
  receiver: {
    id: '',
    name: ''
  }
};

export type createTransactionValidationFields = {
  type: string;
  paymentType: string;
  product: string;
  investor: string;
  investors: string;
  ticketSize: string,
  quantity: string,
  receiver: string;
};

export const defaultErrors: createTransactionValidationFields = {
  paymentType: '',
  type: '',
  product: '',
  investor: '',
  investors: '',
  ticketSize: '',
  quantity: '',
  receiver: ''
};

// === TODO: add more errors can be displayed from BE
export const transactionErrors = {
  'The maximum amount of sales is exceeded': 'quantity',
  "You can't sell a product to yourself": 'receiver'
};

export const getAvailableValues = (product: Product | Holding, ticketSize: number): [number, number] => {
  const availableVolume = product?.realAvailableVolume! * product?.ticketSize!;

  const availableAmount = Math.floor(availableVolume / Number(ticketSize));

  return [availableVolume, availableAmount];
};

export const tableHeadAmountReceived = (type: PaymentType) => {
  return [
    'pages.transactions.form.table.head.investor',
    'pages.transactions.form.table.head.tickets',
    type === PaymentType.INTEREST ? 'pages.transactions.form.table.head.interestReceived' : 'pages.transactions.form.table.head.amountRepaid',
  ];
};

export const paymentTypes = (category: ProductCategory) => {
  switch (category) {
    case ProductCategory.Bond:
      return [
        {
          value: PaymentType.INTEREST,
          label: 'components.table.transactions.type.interest',
        },
        {
          value: PaymentType.REPAYMENT,
          label: 'components.table.transactions.type.repayment'
        },
        {
          value: PaymentType.GENERIC,
          label: 'components.table.transactions.type.generic'
        }
      ];
    
    case ProductCategory.Share:
    case ProductCategory.Certificate:
      return [
        {
          value: PaymentType.DIVIDEND,
          label: 'components.table.transactions.type.dividend'
        }
      ];

    default:
      return [];
  }
};

type CreateAmountReceivedRow = {
  investors: Investor[],
  product: Product,
  paymentType: PaymentType,
  amount: number
};
export const createAmountReceivedRow = ({
  investors, 
  product, 
  paymentType,
  amount
}: CreateAmountReceivedRow): Row[] => {
  return investors.map(investor => {
    const { holding } = investor;
    const investorColumnValue = isNaturalPerson(investor) ?
      `${investor.firstName} ${investor.lastName}` :
      investor?.companyName;

    const investorName = {
      type: TableCellTypes.STRING,
      value: investorColumnValue,
    };

    let ticketValue = 0;

    if (holding && holding.availableVolume) {
      ticketValue = holding.availableVolume;
    }

    if (paymentType === PaymentType.REPAYMENT && holding && holding.amountRepaid > 0) {
      ticketValue -= holding.amountRepaid / holding.ticketSize;
    }

    const tickets = {
      type: TableCellTypes.STRING,
      value: ticketValue.toString()
    };

    const interestReceived = {
      type: TableCellTypes.CURRENCY,
      value: holding 
        ? getInterestReceived({
          holding,
          product,
          paymentType,
          amount
        }).toString()
        : '0'
    };

    const tableRows: TableCell[] = [
      investorName,
      tickets,
      interestReceived
    ];

    return tableRows;
  });
};