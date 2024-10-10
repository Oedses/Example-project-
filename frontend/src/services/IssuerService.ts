import { AxiosResponse } from 'axios';

import { issuer } from './paths';

import api, { AuthHeader } from '../api';

import { Pageable } from '../../../shared/types/response';
import { ComplexIssuer, Issuer, IssuerOverview } from '../../../shared/types/issuer';

export default class IssuerService {
  public static getOverview = (): Promise<AxiosResponse<any, IssuerOverview>> =>
    api.get(issuer.overview, { headers: AuthHeader() });

  public static getList = (query: string): Promise<AxiosResponse<Pageable<Issuer>, Issuer[]>> =>
    api.get(`${issuer.list}?${query}`, { headers: AuthHeader() });

  public static getComplex = (id: string): Promise<AxiosResponse<ComplexIssuer>> =>
    api.get(`${issuer.complex}/${id}`, { headers: AuthHeader() });
}