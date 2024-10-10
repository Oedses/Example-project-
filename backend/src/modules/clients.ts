import { Config } from '../config';
import MailClient, { IMailClient } from '../clients/MailClient';
import GraphClient, { IGraphClient } from '../clients/GraphClient';
import AzureADPassportClient from '../clients/AzureADPassportClient';
import { Db } from 'mongodb';
import { ZipCodeClient } from '../clients/ZipCodeClient';

export default class Clients {

  readonly mailClient: IMailClient;

  readonly graphClient: IGraphClient;

  readonly passportAzureADClient: AzureADPassportClient;

  readonly zipCodeClient: ZipCodeClient;

  constructor(config: Config, pool: Db) {
    this.mailClient = new MailClient(config);
    this.graphClient = new GraphClient(config);
    this.passportAzureADClient = new AzureADPassportClient(config, pool);
    this.zipCodeClient = new ZipCodeClient(config);
  }
}
