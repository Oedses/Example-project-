import { Context, ParameterizedContext } from 'koa';
import Router from 'koa-router';
import UserService from '../../services/users';
import { AssignRoleRequest, DeleteUserRequest, ChangeEmailRequest, ChangePasswordRequest, ChangePhoneRequest, User } from '../../../../shared/types/user';
import { accessChecker, auth, validate } from '../../middlewares';
import { assignRoleRequest, createUserRequest, deleteUserRequest, changeEmailRequest, getInvestorsListRequest, getIssuersListRequest, changePasswordRequest, changePhoneRequest, updateUserRequest, checkVerificationCodeRequest } from './validators';
import { InvestorsListRequest } from '../../../../shared/types/investor';
import { IssuersListRequest } from '../../../../shared/types/issuer';
import { Roles } from '../../../../shared/types/common';
import { CheckVerificationCodeRequest } from '../../../../shared/types/verification-code';

export default class UsersController {

  readonly service: UserService;

  constructor(userService: UserService) {
    this.service = userService;
  }

  createUser = async (ctx: Context) => {
    const { body, user: currentUser } = ctx.state;
    const user = await this.service.createUser(body, currentUser);
    ctx.body = user;
  };

  updateUser = async (ctx: Context) => {
    const { body, user: currentUser } = ctx.state;
    const user = await this.service.updateUser(ctx.params.id, body, currentUser);
    ctx.body = user;
  };

  changeEmail = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.changeEmail(user, body);
  };

  сhangePhone = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.сhangePhone(user, body);
  };

  changePassword = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.changePassword(user, body);
  };

  checkVerificationCode = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.checkVerificationCode(user, body);
  };

  getUser = async (ctx: Context) => {
    ctx.body = await this.service.getUser(ctx.query.id as string);
  };

  getInvestorOverview = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getInvestorOverview(ctx.query as any, ctx.state.user);
  };

  getInvestorsList = async (ctx: ParameterizedContext) => {
    const { body } = ctx.state;
    ctx.body = await this.service.getInvestorsList(body);
  };

  getInvestorPortfolio = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getInvestorPortfolio(ctx.query as any, ctx.state.user);
  };

  getComplexInvestor = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getComplexInvestor({ ...ctx.params });
  };

  getIssuersList = async (ctx: ParameterizedContext) => {
    const { body } = ctx.state;
    ctx.body = await this.service.getIssuersList(body);
  };

  getIssuerOverview = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getIssuerOverview({ ...ctx.params, ...ctx.query }, ctx.state.user);
  };

  getComplexIssuer = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getComplexIssuer({ ...ctx.params });
  };

  getAdminOverview = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getAdminOverview({ ...ctx.params, ...ctx.query });
  };

  requestDeactivate = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.requestDeactivate(ctx.state.user);
  };

  deactivateUser = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.deactivateUser(ctx.params.id, ctx.state.user);
  };

  deleteUser = async (ctx: Context) => {
    const { id } = ctx.params;

    ctx.body = await this.service.deleteUser(id, ctx.state.user);
  };

  assignRole = async (ctx: ParameterizedContext) => {
    const { body } = ctx.state;
    ctx.body = await this.service.assignRole(body);
  };

  get router(): Router {
    return new Router()
      .post('/', validate<User>(createUserRequest), this.createUser)

      // auth routes
      .use(auth())
      .get('/', this.getUser)

      .post('/createByAdmin',
        accessChecker([Roles.admin]),
        validate<User>(createUserRequest),
        this.createUser
      )

      .post('/check-verification-code',
        validate<CheckVerificationCodeRequest>(checkVerificationCodeRequest),
        this.checkVerificationCode
      )

      .put(
        '/change-email',
        validate<ChangeEmailRequest>(changeEmailRequest),
        this.changeEmail
      )

      .put(
        '/change-phone',
        accessChecker([Roles.investor, Roles.issuer]),
        validate<ChangePhoneRequest>(changePhoneRequest),
        this.сhangePhone
      )

      .put(
        '/change-password',
        validate<ChangePasswordRequest>(changePasswordRequest),
        this.changePassword
      )

      .put(
        '/:id',
        validate<User>(updateUserRequest),
        this.updateUser
      )

      .get(
        '/investor/overview',
        accessChecker([Roles.investor]),
        this.getInvestorOverview
      )
      .get(
        '/investors',
        accessChecker([Roles.admin, Roles.compliance]),
        validate<InvestorsListRequest>(getInvestorsListRequest),
        this.getInvestorsList
      )
      .get(
        '/investor/complex/:id',
        this.getComplexInvestor
      )
      .get(
        '/investor/portfolio',
        accessChecker([Roles.investor]),
        this.getInvestorPortfolio
      )

      .get(
        '/issuer/overview',
        accessChecker([Roles.issuer]),
        this.getIssuerOverview
      )
      .get(
        '/issuer/complex/:id',
        this.getComplexIssuer
      )
      .get(
        '/issuers',
        accessChecker([Roles.admin, Roles.compliance]),
        validate<IssuersListRequest>(getIssuersListRequest),
        this.getIssuersList
      )

      .get(
        '/overview/:id',
        accessChecker([Roles.admin]),
        this.getAdminOverview
      )

      .delete(
        '/:id',
        accessChecker([Roles.admin]),
        validate<DeleteUserRequest>(deleteUserRequest),
        this.deleteUser
      )
      .post(
        '/request-deactivate',
        accessChecker([Roles.issuer, Roles.investor]),
        this.requestDeactivate
      )
      .post(
        '/deactivate/:id',
        accessChecker([Roles.admin]),
        this.deactivateUser
      )
      .post(
        '/assign',
        accessChecker([Roles.admin]),
        validate<AssignRoleRequest>(assignRoleRequest),
        this.assignRole
      );
  }
}
