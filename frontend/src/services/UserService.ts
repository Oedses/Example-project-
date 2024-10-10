import { AxiosResponse } from "axios";

import { users }  from "./paths";

import api, { AuthHeader } from "../api";

import { ChangeEmailRequest, ChangePasswordRequest, ChangePhoneRequest, User } from "../../../shared/types/user";

import { CheckVerificationCodeRequest } from "../../../shared/types/verification-code";

export default class UserService {
  public static create = (data: User): Promise<AxiosResponse<any>> =>
    api.post(users.create, data);


  public static createByAdmin = (data: User): Promise<AxiosResponse<any>> =>
    api.post(users.createByAdmin, data, { headers: AuthHeader() });


  public static update = (data: User, id: string): Promise<AxiosResponse<any>> =>
    api.put(`${users.update}/${id}`, data, { headers: AuthHeader() });

  public static changeEmail = (data: ChangeEmailRequest): Promise<AxiosResponse<any>> =>
    api.put(`${users.changeEmail}`, data, { headers: AuthHeader() });

  public static сhangePhone = (data: ChangePhoneRequest): Promise<AxiosResponse<any>> =>
    api.put(`${users.сhangePhone}`, data, { headers: AuthHeader() });
  
  public static changePassword = (data: ChangePasswordRequest): Promise<AxiosResponse<any>> =>
    api.put(`${users.changePassword}`, data, { headers: AuthHeader() });

  public static checkVerificationCode = (data: CheckVerificationCodeRequest): Promise<AxiosResponse<any>> =>
    api.post(`${users.checkVerificationCode}`, data, { headers: AuthHeader() });

  public static requestDeactivate = (): Promise<AxiosResponse<any>> =>
    api.post(users.requestDeactivate, {}, { headers: AuthHeader() });


  public static deactivate = (id: string): Promise<AxiosResponse<any>> =>
    api.post(`${users.deactivate}/${id}`, {}, { headers: AuthHeader() });


  public static remove = (id: string): Promise<AxiosResponse<any>> =>
    api.delete(`${users.delete}/${id}`, { headers: AuthHeader() });
}

