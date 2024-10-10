import { ComplianceLogItem } from "../../../../shared/types/common";
import Context from "./context";

type ComplianceLogData = {
  logs: ComplianceLogItem[];
  rejectLogId: string;
};

export const initialComplianceLogState: ComplianceLogData = {
  logs: [],
  rejectLogId: ''
};

const ComplianceContext = new Context(initialComplianceLogState);

export default ComplianceContext;