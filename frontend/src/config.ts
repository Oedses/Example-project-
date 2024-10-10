export interface Config {
  REACT_APP_BASE_URL: string;
  REACT_APP_API_URL: string;
  REACT_APP_OAUTH_CLIENT_ID: string;
  REACT_APP_OAUTH_SCOPE: string;
  REACT_APP_NODE_ENV: string;
  REACT_APP_OAUTH_TENANT_NAME: string;
  REACT_APP_OAUTH_USER_FLOW: string;
}

const config: Config = {
  REACT_APP_OAUTH_USER_FLOW: process.env.REACT_APP_OAUTH_USER_FLOW || '',
  REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL || '',
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
  REACT_APP_OAUTH_CLIENT_ID: process.env.REACT_APP_OAUTH_CLIENT_ID || '',
  REACT_APP_OAUTH_SCOPE: process.env.REACT_APP_OAUTH_SCOPE || '',
  REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV || '',
  REACT_APP_OAUTH_TENANT_NAME: process.env.REACT_APP_OAUTH_TENANT_NAME || ''
};

export default config;
