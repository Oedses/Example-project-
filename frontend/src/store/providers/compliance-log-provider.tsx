import { FC } from "react";
import ComplianceLogContext, { initialComplianceLogState } from "../contexts/compliance-log-context";
import Provider from "./provider";

const ComplianceLogProvider: FC = ({ children }) => (
  <Provider
    initialState={initialComplianceLogState}
    ContextComponent={ComplianceLogContext}
  >
    {children}
  </Provider>
);

export default ComplianceLogProvider;