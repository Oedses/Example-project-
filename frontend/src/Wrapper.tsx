
import { FC } from 'react';

import { Localization } from './localization';

import UserProvider from './store/providers/user-provider';
import ChartProvider from './store/providers/chart-provider';
import ComplianceLogProvider from './store/providers/compliance-log-provider';
import SummaryProvider from './store/providers/summary-provider';

const Wrapper: FC = ({ children }) => (
  <UserProvider>
    <ChartProvider>
      <ComplianceLogProvider>
        <SummaryProvider>
          <Localization>
            { children }
          </Localization>
        </SummaryProvider>
      </ComplianceLogProvider>
    </ChartProvider>
  </UserProvider>
);

export default Wrapper;