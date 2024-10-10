import Joi, { ValidationResult } from "joi";
import regex from "../../../shared/regex";
import { AdminOverview, AdminOverviewRequest } from "../../../shared/types/admin";
import { ObjKeyValue } from "../../../shared/types/common";
import { ComplexInvestor, ComplexInvestorRequest, Investor, InvestorOverview, InvestorPortfolio, InvestorsListRequest, isLegalEntity, isNaturalPerson } from "../../../shared/types/investor";
import { ComplexIssuer, ComplexIssuerRequest, Issuer, IssuerOverview, IssuerOverviewRequest, IssuersListRequest } from "../../../shared/types/issuer";
import { Pageable } from "../../../shared/types/response";
import { AssignRoleRequest, DeleteUserRequest, ChangeEmailRequest, GetUserRequest, isAdmin, isBaseUser, isCompliance, isInvestor, isIssuer, ChangePasswordRequest, ChangePhoneRequest, User } from "../../../shared/types/user";
import { CheckVerificationCodeRequest } from "../../../shared/types/verification-code";

export interface IUserRepository {
  create(data: User): Promise<User>
  findById(id: string, exception?: boolean): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  find(data: Object, filters?: ObjKeyValue): Promise<User[]>
  updateById(id: User['id'], data: Partial<User>): Promise<User>
  findAdmins(): Promise<User[]>
  getInvestorsList(query: InvestorsListRequest): Promise<Pageable<Investor>>
  getInvestorOverview(currentUser: User, chartData: InvestorOverview['chartData']): Promise<InvestorOverview>
  getComplexInvestor(query: ComplexInvestorRequest): Promise<ComplexInvestor>
  getInvestorPortfolio(currentUser: User, chartData: InvestorPortfolio['chartData']): Promise<InvestorPortfolio>
  getComplexIssuer(query: ComplexIssuerRequest): Promise<ComplexIssuer>
  getIssuersList(query: IssuersListRequest): Promise<Pageable<Issuer>>
  getIssuerOverview(query: IssuerOverviewRequest, user: User): Promise<IssuerOverview>
  getAdminOverview(query: AdminOverviewRequest, chartData: AdminOverview['chartData']): Promise<AdminOverview>,
  getEmailsAdmin(): Promise<string[]>,
  userDelete(id: string): Promise<void>
}

export function validateInvestorsListRequest(x: any): ValidationResult<InvestorsListRequest> {
  return Joi.object({
    skip: Joi.string().required(),
    limit: Joi.string().required(),
    name: Joi.string().optional(),
    status: Joi.string().optional(),
    productId: Joi.string().optional(),
    isHolding: Joi.boolean().optional(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    startTotalProducts: Joi.number().positive().allow(0),
    endTotalProducts: Joi.number().positive().allow(0),
    entityType: Joi.string().optional()
  }).validate(x);
}

const validateNaturalPersonInvestor = Joi.object({
  email: Joi.string().required().email(),
  type: Joi.string().required(),
  phone: Joi.string()
    .regex(regex.phone)
    .message("Invalid phone format")
    .allow('')
    .optional(),
  address: Joi.string()
    .max(50)
    .regex(regex.lettersAndNumbers)
    .message("Address: special symbols are not allowed")
    .allow('')
    .optional(),
  postcode: Joi.string()
    .regex(regex.postcode)
    .message("Invalid postcode format")
    .allow('')
    .optional(),
  city: Joi.string()
    .max(50)
    .regex(regex.alphabetic)
    .message("City name: special symbols are not allowed")
    .allow('')
    .optional(),
  firstName: Joi.string()
    .max(50)
    .regex(regex.alphabetic)
    .message("First name: only letters are allowed")
    .required(),
  lastName: Joi.string()
    .max(50)
    .regex(regex.alphabetic)
    .message("Last name: only letters are allowed")
    .required(),
  bsn: Joi.number().max(999999999).allow('').optional(),
  role: Joi.string().required()
});

const validateLegalEntityInvestor = Joi.object({
  email: Joi.string().required().email(),
  type: Joi.string().required(),
  phone: Joi.string()
    .regex(regex.phone)
    .message("Invalid phone format")
    .allow('')
    .optional(),
  address: Joi.string()
    .max(50)
    .regex(regex.lettersAndNumbers)
    .message("Address: invalid symbols")
    .allow('')
    .optional(),
  postcode: Joi.string()
    .regex(regex.postcode)
    .message("Invalid postcode format")
    .allow('')
    .optional(),
  city: Joi.string()
    .max(50)
    .regex(regex.alphabetic)
    .message("City name: special symbols are not allowed")
    .allow('')
    .optional(),
  kvk: Joi.number().max(99999999).allow('').optional(),
  companyName: Joi.string()
    .max(50)
    .regex(regex.lettersAndNumbers)
    .message("Company name: only letters are allowed")
    .required(),
  role: Joi.string().required()
});

const validateCreateAdmin = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required().email(),
  role: Joi.string().required()
});


const validateCreateIssuer = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  phone: Joi.string()
    .regex(regex.phone)
    .message("Invalid phone format")
    .allow('')
    .optional(),
  address: Joi.string()
    .max(50)
    .regex(regex.lettersAndNumbers)
    .message("Address: invalid symbols")
    .allow('')
    .optional(),
  vat: Joi.string()
    .max(50)
    .regex(regex.lettersAndNumbers)
    .message("VAT ID: invalid symbols")
    .allow('')
    .optional(),
  postcode: Joi.string()
    .regex(regex.postcode)
    .message("Invalid postcode format")
    .allow('')
    .optional(),
  city: Joi.string()
    .max(50)
    .regex(regex.alphabetic)
    .message("City name: only letters are allowed")
    .allow('')
    .optional(),
  kvk: Joi.number().max(99999999).allow('').optional(),
  role: Joi.string().required()
});

const validateUser = Joi.object({
  email: Joi.string().required().email(),
});

export function validateCreateUser(x: unknown): ValidationResult<User> | false {
  if (isInvestor(x) && isNaturalPerson(x)) return validateNaturalPersonInvestor.validate(x, { stripUnknown: true });

  if (isInvestor(x) && isLegalEntity(x)) return validateLegalEntityInvestor.validate(x, { stripUnknown: true });

  if (isAdmin(x) || isCompliance(x)) return validateCreateAdmin.validate(x, { stripUnknown: true });

  if (isIssuer(x)) return validateCreateIssuer.validate(x, { stripUnknown: true });

  if (isBaseUser(x)) return validateUser.validate(x, { stripUnknown: true });

  return false;
}

export function validateChangeEmail(x: unknown): ValidationResult<ChangeEmailRequest> {
  return Joi.object({
    email: Joi.string().required().email(),
  }).validate(x);
}

export function validateChangePhone(x: unknown): ValidationResult<ChangePhoneRequest> {
  return Joi.object({
    phone: Joi.string()
    .regex(regex.phone)
    .message("Invalid phone format")
    .allow('')
    .optional()
  }).validate(x);
}

export function validateChangePassword(x: unknown): ValidationResult<ChangePasswordRequest> {
  return Joi.object({
    // currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    repeatNewPassword: Joi.string().required().valid(Joi.ref('newPassword')).options({
      messages: { "any.only": "Must match newPassword"}
    }),
  }).validate(x);
}

export function validateCheckVerificationCode(x: unknown): ValidationResult<CheckVerificationCodeRequest> {
  return Joi.object({
    code: Joi.string().required(),
    type: Joi.string().required(),
  }).validate(x);
}

export function validateUpdateUser(x: unknown): ValidationResult<User> | false {
  if (isInvestor(x) && isNaturalPerson(x)) return validateNaturalPersonInvestor.validate(x, { stripUnknown: true });

  if (isInvestor(x) && isLegalEntity(x)) return validateLegalEntityInvestor.validate(x, { stripUnknown: true });

  if (isAdmin(x) || isCompliance(x)) return validateCreateAdmin.validate(x, { stripUnknown: true });

  if (isIssuer(x)) return validateCreateIssuer.validate(x, { stripUnknown: true });

  if (isBaseUser(x)) return validateUser.validate(x, { stripUnknown: true });

  return false;
}

export function validateGetUserRequest(x: any): ValidationResult<GetUserRequest> {
  return Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email().required()
  }).validate(x);
}

export function validateDeleteUserRequest(x: any): ValidationResult<DeleteUserRequest> {
  return Joi.object({
    id: Joi.string().required(),
  }).validate(x);
}

export function validateAssignRoleRequest(x: any): ValidationResult<AssignRoleRequest> {
  return Joi.object({
    role: Joi.string().required(),
    email: Joi.string().email().required()
  }).validate(x);
}

export function validateIssuersListRequest(x: any): ValidationResult<IssuersListRequest> {
  return Joi.object({
    skip: Joi.string().required(),
    limit: Joi.string().required(),
    name: Joi.string().optional(),
    status: Joi.string().optional(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    startTotalProducts: Joi.number().positive().allow(0),
    endTotalProducts: Joi.number().positive().allow(0),
  }).validate(x);
}

export function validateIssuerOverviewRequest(x: any): ValidationResult<IssuerOverviewRequest> {
  return Joi.object({
    id: Joi.string().required(),
    periodType: Joi.string().required()
  }).validate(x);
}