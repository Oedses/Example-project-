import { Outlet } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';

import { AppProps } from './app.props';
import { Pages } from './Pages';

import './index.scss';
import Wrapper from './Wrapper';
import { Summary } from './views/dashboard/Summary';

const App = ({ pca }: AppProps) => (
  <Wrapper>
    <MsalProvider instance={pca}>
      <Summary />
      <Pages />
      <Outlet />
    </MsalProvider>
  </Wrapper>
);

export default App;
