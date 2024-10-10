import { ComplianceInvestors } from "../../../../../../shared/types/common";
import { createSeparatorsNumber } from "../../../../utils/fn";

import './compliance-tooltip.scss';

const ComplianceTooltipItem = ({ fullName, amount }: ComplianceInvestors) => (
  <div className="compliance-tooltip__item">
    <div className="compliance-tooltip__name">{ fullName }</div>
    <div className="compliance-tooltip__amount">€ { createSeparatorsNumber(amount) }</div>
  </div>
);

export default ComplianceTooltipItem;