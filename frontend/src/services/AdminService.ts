import { AxiosResponse } from "axios";

import { admin, compliance }  from "./paths";

import api, { AuthHeader } from "../api";

import { AdminOverview } from "../../../shared/types/admin";
import { ComplianceLogItem, PeriodType } from "../../../shared/types/common";
import { Pageable } from "../../../shared/types/response";
import { ComplianceFiltersDataResponse } from "../../../shared/types/compliance";


export default class AdminService {
  public static getOverview = (id: string, period: PeriodType = PeriodType.month): Promise<AxiosResponse<any, AdminOverview>> =>
    api.get(`${admin.overview}/${id}?periodType=${period}`, { headers: AuthHeader() });


  public static getComplianceList = (query: string): Promise<AxiosResponse<Pageable<ComplianceLogItem>, ComplianceLogItem[]>> =>
    api.get(`${compliance}?${query}`, { headers: AuthHeader() });

  public static getComplianceFiltersData = (): Promise<AxiosResponse<ComplianceFiltersDataResponse>> =>
    api.get(`${compliance}/filters-data`, { headers: AuthHeader() });


  public static approveCompliance = (id: string): Promise<AxiosResponse<any, AdminOverview>> =>
    api.put(`${compliance}/${id}/approve`, {}, { headers: AuthHeader() });


  public static rejectCompliance = (id: string, reason: string): Promise<AxiosResponse<any, AdminOverview>> =>
    api.put(`${compliance}/${id}/reject`, { reason }, { headers: AuthHeader() });
}

