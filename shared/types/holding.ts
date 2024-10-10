import { PaymentFrequency, Product } from './product';
import { Investor } from './investor';

type Holding = {
  id: string
  name: string
  product: Product | string
  investor: Investor | string
  quantity: number
  ticketSize: number
  amountReceived: number,
  realAvailableVolume?: number
  processingAvailableVolume?: number
  heldSince: Date
  nonCallPeriod: Date | null
  maturityDate: Date | null
  category: string
  availableVolume: number
  paymentFrequency?: PaymentFrequency
  amountRepaid: number
};

type CreateHoldingRequest = {
  id?: string
  name?: string
  product: string
  investor: string
  quantity: number
  ticketSize: number
  heldSince?: Date
  category?: string
  nonCallPeriod?: Date | null
  maturityDate?: Date | null
}

type HoldingsListRequest = {
  investorId: string
  skip: string
  limit: string
  category?: string
  isSellList?: string
}

export type { Holding, CreateHoldingRequest, HoldingsListRequest };