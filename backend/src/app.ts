import Koa from 'koa';
import cors from '@koa/cors';
import koaBody from 'koa-body';
import morgan from 'koa-morgan';
import passport from 'koa-passport';
import { Server } from 'http';
import initDB from './db';
import { Config } from './config';
import Repositories from './modules/repositories';
import Services from './modules/services';
import Controllers from './contollers';
import Clients from './modules/clients';
import { MongoClient, Db } from 'mongodb';

export default class AppServer {

  server: Server | null = null;

  client: MongoClient | null = null;

  pool: Db | null = null;

  async run(config: Config): Promise<void> {
    this.pool = await initDB(config);
    const clients = new Clients(config, this.pool);
    const repositories = new Repositories(this.pool);
    const services = new Services(repositories, clients, this.pool);
    const api = new Controllers(services);

    const app = new Koa();

    app
      .use(morgan('dev'))
      .use(passport.initialize());

    passport.use(clients.passportAzureADClient.client);

    this.server = app
      .use(koaBody())
      .use(cors({ credentials: true }))
      .use(api.routes)
      .listen(config.PORT, () => console.info(`server listen on ${ config.PORT }`));
  }

  async stop(): Promise<void>{
    this.client?.close();
    this.server?.close();
    console.info('server closed');
  }
}
