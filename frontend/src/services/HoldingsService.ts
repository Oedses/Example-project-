import { AxiosResponse } from 'axios';

import { holdings } from './paths';

import api, { AuthHeader } from '../api';

import { Pageable } from '../../../shared/types/response';

import { Holding } from '../../../shared/types/holding';

export default class HoldingService {
  public static getList = (query: string): Promise<AxiosResponse<Pageable<Holding>, Holding[]>> =>
    api.get(`${holdings}?${query}`, { headers: AuthHeader() });
}

