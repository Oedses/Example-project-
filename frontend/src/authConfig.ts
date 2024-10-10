import { Configuration, LogLevel } from '@azure/msal-browser';
import config from './config';

export const b2cPolicies = {
  names: {
    signUpSignIn: config.REACT_APP_OAUTH_USER_FLOW
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${config.REACT_APP_OAUTH_TENANT_NAME}.b2clogin.com/${config.REACT_APP_OAUTH_TENANT_NAME}.onmicrosoft.com/${config.REACT_APP_OAUTH_USER_FLOW}`,
      scopes: [config.REACT_APP_OAUTH_SCOPE]
    }
  },
  authorityDomain: `${config.REACT_APP_OAUTH_TENANT_NAME}.b2clogin.com`
};

export const msalConfig: Configuration = {
  auth: {
    clientId: config.REACT_APP_OAUTH_CLIENT_ID, // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose SUSI as your default authority.
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: '/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
  },

  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      }
    }
  }
};

export const protectedResources = {
  api: {
    endpoint: config.REACT_APP_API_URL,
    scopes: [`https://${config.REACT_APP_OAUTH_TENANT_NAME}.onmicrosoft.com/api/${config.REACT_APP_OAUTH_SCOPE}`] // e.g. api://xxxxxx/access_as_user
  }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: [...protectedResources.api.scopes]
};
