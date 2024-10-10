import { Context, ParameterizedContext } from 'koa';
import Router from 'koa-router';
import { accessChecker, auth, validate } from '../../middlewares';
import { complianceListRequest, rejectComplianceRequest } from './validators';
import ComplianceService from '../../services/compliance';
import { ComplianceListRequest, RejectComplianceRequest } from '../../../../shared/types/compliance';
import { Roles } from '../../../../shared/types/common';

export default class ComplianceController {

  readonly service: ComplianceService;

  constructor(complianceService: ComplianceService) {
    this.service = complianceService;
  }

  approveCompliance = async (ctx: ParameterizedContext) => {
    const { params: { id }, state: { user } } = ctx;
    ctx.body = await this.service.approveCompliance(id, user);
  };

  rejectCompliance = async (ctx: ParameterizedContext) => {
    const { state: { body, user }, params: { id } } = ctx;
    ctx.body = await this.service.rejectCompliance(id, body, user);
  };

  getComplianceList = async (ctx: Context) => {
    const { body } = ctx.state;
    ctx.body = await this.service.getComplianceList(body);
  };

  getFiltersData = async (ctx: Context) => {
    ctx.body = await this.service.getFiltersData();
  };

  get router(): Router {
    return new Router()
      .put(
        '/:id/approve',
        accessChecker([Roles.compliance]),
        this.approveCompliance
      )
      .put(
        '/:id/reject',
        accessChecker([Roles.compliance]),
        validate<RejectComplianceRequest>(rejectComplianceRequest),
        this.rejectCompliance
      )
      .get(
        '/',
        accessChecker([Roles.admin, Roles.compliance]),
        validate<ComplianceListRequest>(complianceListRequest),
        this.getComplianceList
      )
      .get(
        '/filters-data',
        accessChecker([Roles.admin, Roles.compliance]),
        this.getFiltersData
      );
  }
}
