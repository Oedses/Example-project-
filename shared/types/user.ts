import { Issuer } from './issuer';
import { Investor, isLegalEntity, isNaturalPerson } from './investor';
import { Roles } from './common';
import { Admin } from './admin';

type GetUserRequest = {
  id: string
}

type AssignRoleRequest = {
  email: string
  role: Roles
}

type DeleteUserRequest = {
  id: string
}

type BaseUser = {
  id?: string
  email: string
  role?: Roles
  firstName?: string
  lastName?: string
  name?: string
  isRequestDeactivate?: boolean
}

type User = (Issuer | Investor | Admin) & BaseUser

export type ChangeEmailRequest = {
  email: string
}

export type ChangePhoneRequest = {
  phone: string
}

export type ChangePasswordRequest = {
  // currentPassword: string
  newPassword: string
  repeatNewPassword: string
}

export const isInvestor = (x: unknown): x is Investor => (x as Investor).role === Roles.investor;

export const isIssuer = (x: unknown): x is Issuer => (x as Issuer).role === Roles.issuer;

export const isAdmin = (x: unknown): x is Admin => (x as Admin).role === Roles.admin;

export const isCompliance = (x: unknown): x is Admin => (x as Admin).role === Roles.compliance;

export const isBaseUser = (x: unknown): x is BaseUser => !(x as BaseUser).role;

export type { User, BaseUser, GetUserRequest, AssignRoleRequest, DeleteUserRequest };

export const getDisplayName = (data: BaseUser | Partial<BaseUser>, mailNickname: string = '') => {
  if (isNaturalPerson(data) || isAdmin(data) || isCompliance(data)) return `${data.firstName} ${data.lastName}`;
  if (isIssuer(data)) return data.name;
  if (isLegalEntity(data)) return data.companyName;
  if (isBaseUser(data)) return mailNickname;
  return '';
};