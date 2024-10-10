import React from 'react';
import { ComplianceInvestors } from '../../../../../../shared/types/common';
import ComplianceTooltipItem from './compliance-tooltip-item';

import './compliance-tooltip.scss';

type ComplianceActionTooltipProps = {
  items?: ComplianceInvestors[];
};
const ComplianceActionTooltip = ({ items }: ComplianceActionTooltipProps) => {
  if (!items) return null;

  return (
    <section className='compliance-tooltip__container'>
      {items.map(data => (
        <ComplianceTooltipItem key={data.id} {...data} />
      ))}
    </section>
  );
};

export default ComplianceActionTooltip;