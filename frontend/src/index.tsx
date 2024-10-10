import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';

import { init } from './localization/i18n';

import { msalConfig } from './authConfig';

import App from './App';

export const msalInstance = new PublicClientApplication(msalConfig);

const setup = () => {
  init();

  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <App pca={msalInstance} />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
  );
};

setup();
