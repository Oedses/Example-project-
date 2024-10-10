import { BearerStrategy, IBearerStrategyOptionWithRequest, ITokenPayload } from 'passport-azure-ad';
import { Config } from '../config';
import MongoUserRepository from '../repositories/MongoUserRepository';
import { IUserRepository } from '../domains/users';
import { Db } from 'mongodb';

class AzureADPassportClient {
  readonly client: BearerStrategy;

  readonly userRepository: IUserRepository;

  constructor(config: Config, pool: Db) {
    this.userRepository = new MongoUserRepository(pool);

    const options: IBearerStrategyOptionWithRequest = {
      identityMetadata: `https://${config.OAUTH_TENANT_NAME}.b2clogin.com/${config.OAUTH_TENANT_NAME}.onmicrosoft.com/${config.OAUTH_USER_FLOW}/v2.0/.well-known/openid-configuration`,
      clientID: config.OAUTH_CLIENT_ID,
      audience: config.OAUTH_CLIENT_ID,
      issuer: `https://${config.OAUTH_TENANT_NAME}.b2clogin.com/${config.OAUTH_TENANT_ID}/v2.0/`,
      policyName: config.OAUTH_USER_FLOW,
      isB2C: true,
      scope: [config.OAUTH_SCOPE],
      validateIssuer: true,
      loggingLevel: "info",
      passReqToCallback: false
    };

    this.client = new BearerStrategy(options, async (token: ITokenPayload, done: any) => {
      const user = await this.userRepository.findById(token.oid!, false);

      done(null, user, token);
    });
  }
}

export default AzureADPassportClient;