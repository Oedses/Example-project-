import { AxiosResponse } from 'axios';

import { users } from './paths';

import api, { AuthHeader } from '../api';

import { User } from '../../../shared/types/user';

export default class AuthService {
  public static getUserData = (query: string): Promise<AxiosResponse<User, User>> =>
    api.get(`${users.get}?${query}`, {  headers: AuthHeader() });
}

