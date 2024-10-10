import { useEffect } from 'react';
import config from '../../../config';

const RedirectToLogin = () => {
  useEffect(() => {
    window.location.href =
      `https://${config.REACT_APP_OAUTH_TENANT_NAME}.b2clogin.com/${config.REACT_APP_OAUTH_TENANT_NAME}.onmicrosoft.com/${config.REACT_APP_OAUTH_USER_FLOW}/oauth2/v2.0/authorize?client_id=${config.REACT_APP_OAUTH_CLIENT_ID}&nonce=anyRandomValue&redirect_uri=${config.REACT_APP_BASE_URL}/login.html&scope=https://${config.REACT_APP_OAUTH_TENANT_NAME}.onmicrosoft.com/api/${config.REACT_APP_OAUTH_SCOPE} openid&response_type=code`;
  });

  return null;
};

export default RedirectToLogin;
