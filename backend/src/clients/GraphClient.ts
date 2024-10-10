/* eslint-disable @typescript-eslint/no-shadow */
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';
import { Config } from '../config';
import { Roles } from '../../../shared/types/common';

type UserCredentials = {
  accountEnabled: boolean,
  displayName: string,
  mailNickname: string,
  userPrincipalName: string,
  identities:
  { signInType: string, issuer: string, issuerAssignedId: string }[],
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean,
    password: string,
  },
};

export interface IGraphClient {
  createUser: <T>(user: UserCredentials) => Promise<T>
  updateUser: (id: string, body: Partial<UserCredentials>) => Promise<any>
  addRoleToUser: (userId: string, role: Roles) => Promise<any>
  getUserRole: (userId: string) => Promise<any>
  getUser: (userPrincipalName: string) => Promise<any>
  deleteUser: (userId: string) => Promise<any>
}

class GraphClient implements IGraphClient {
  client: Client;

  constructor(config: Config) {
    const credential = new ClientSecretCredential(config.OAUTH_TENANT_ID, config.OAUTH_CLIENT_ID, config.OAUTH_CLIENT_SECRET);

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.client = Client.initWithMiddleware({
      debugLogging: config.OAUTH_DEBUG,
      authProvider,
    });
  }

  createUser = async <T>(user: UserCredentials): Promise<T> => this.client.api('/users').post(user);

  addRoleToUser = async (userId: string, role: Roles) => {
    let roleIsExist = false;

    try {
      await this.getUserRole(userId);
      roleIsExist = true;
    } catch (err) {
      roleIsExist = false;
    }

    const extension = {
      '@odata.type': 'microsoft.graph.openTypeExtension',
      extensionName: 'Com.Contoso.Referral',
      role
    };

    if (roleIsExist) {
      await this.client.api(`/users/${userId}/extensions/Com.Contoso.Referral`).update(extension);
    } else {
      await this.client.api(`/users/${userId}/extensions`).post(extension);
    }

    return this.getUserRole(userId);
  };

  deleteUser = async (userId: string) => this.client.api(`/users/${userId}`).delete();

  getUser = (userId: string) =>  this.client.api(`/users/${userId}`).get();

  getUserRole = async (userId: string) =>  this.client.api(`/users/${userId}/extensions/Com.Contoso.Referral`).get();

  updateUser = async (id: string, body: Partial<UserCredentials>) => {
    return this.client.api(`/users/${id}`).patch(body);
  };
}

export default GraphClient;
