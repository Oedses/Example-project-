import { TransactionType } from "../../../../../../shared/types/transaction";

export const MAX_VALUE_LENGTH = 40;

export enum TextColors {
  green = 'green',
  red = 'red',
  gray = 'gray',
  black = 'black',
}

export enum StatusColor {
  processing = "#0096FF",
  fulfilled = '#28A745',
  finalizing = '#28A745',
  active = '#28A745',
  inactive = '#808080',
  rejected =  '#cc3300'
}

export const getColorForColoredString = (type: TransactionType | string): TextColors => {
  if (type === TransactionType.BUY) return TextColors.green;
  if (type === TransactionType.PAYMENT) return TextColors.gray;
  if (type === TransactionType.SELL) return TextColors.red;
  return TextColors.black;
};

export const getColorForStatus = (status: keyof typeof StatusColor): StatusColor => StatusColor[status];