import { AxiosResponse } from 'axios';

import { investor } from './paths';

import api, { AuthHeader } from '../api';

import { Pageable } from '../../../shared/types/response';
import {
  ComplexInvestor,
  Investor,
  InvestorOverview,
  InvestorPortfolio
} from '../../../shared/types/investor';

export default class InvestorService {
  public static getList = (query: string): Promise<AxiosResponse<Pageable<Investor>, Investor[]>> =>
    api.get(`${investor.list}?${query}`, { headers: AuthHeader() });


  public static getOverview = (query: string): Promise<AxiosResponse<any, InvestorOverview>> =>
    api.get(`${investor.overview}?${query}`, { headers: AuthHeader() });


  public static getPortfolio = (query: string): Promise<AxiosResponse<any, InvestorPortfolio>> =>
    api.get(`${investor.portfolio}?${query}`, { headers: AuthHeader() });


  public static getComplex = (id: string): Promise<AxiosResponse<ComplexInvestor>> =>
    api.get(`${investor.complex}/${id}`, { headers: AuthHeader() });
}

