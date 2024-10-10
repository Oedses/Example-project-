import { ComplianceFilters } from "../../../../../../shared/types/compliance";

export const tPath = 'components.table.complianceLog';

export const placeHolderText = 'pages.admin.overview.complianceLog.any';

export const defaultValues: ComplianceFilters = {
  startDate: undefined,
  endDate: undefined,
  relatedBy: undefined,
  relatedTo: undefined,
  action: undefined,
  status: undefined
};
