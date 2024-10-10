/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGO_URL: string;
  OAUTH_CLIENT_ID: string;
  OAUTH_TENANT_NAME: string;
  OAUTH_CLIENT_SECRET: string;
  OAUTH_SCOPE: string;
  OAUTH_USER_FLOW: string;
  OAUTH_TENANT_ID: string;
  OAUTH_DEBUG: boolean;
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
  MAILGUN_PUBLIC_KEY: string;
  MAILGUN_USERNAME: string;
  SUPPORT_EMAIL: string;
  BLOCKCHAIN_URL: string;
  ZIP_CODE_API_KEY: string;
  ZIP_CODE_URL: string,
  ZIP_CODE_DEFAULT_COUNTRY_CODE: string
}

const {
  NODE_ENV,
  PORT,
  MONGO_URL,
  OAUTH_CLIENT_ID,
  OAUTH_TENANT_NAME,
  OAUTH_CLIENT_SECRET,
  OAUTH_SCOPE,
  OAUTH_USER_FLOW,
  OAUTH_TENANT_ID,
  OAUTH_DEBUG,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_PUBLIC_KEY,
  MAILGUN_USERNAME,
  SUPPORT_EMAIL,
  BLOCKCHAIN_URL,
  ZIP_CODE_API_KEY,
  ZIP_CODE_URL,
  ZIP_CODE_DEFAULT_COUNTRY_CODE
} = process.env;

export default {
  NODE_ENV: NODE_ENV!,
  PORT: parseInt(PORT!, 10),
  MONGO_URL: MONGO_URL!,
  OAUTH_CLIENT_ID,
  OAUTH_TENANT_NAME,
  OAUTH_CLIENT_SECRET,
  OAUTH_DEBUG: Boolean(OAUTH_DEBUG),
  OAUTH_USER_FLOW,
  OAUTH_SCOPE,
  OAUTH_TENANT_ID,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_PUBLIC_KEY,
  MAILGUN_USERNAME,
  SUPPORT_EMAIL,
  BLOCKCHAIN_URL,
  ZIP_CODE_API_KEY,
  ZIP_CODE_URL,
  ZIP_CODE_DEFAULT_COUNTRY_CODE,
} as Config;
