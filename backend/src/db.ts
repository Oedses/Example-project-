import { MongoClient } from 'mongodb';
import { Config } from './config';

import dotenv from 'dotenv';

dotenv.config();

interface DbOptions {
  socketTimeoutMS: number;
  keepAlive: boolean;
  useNewUrlParser: boolean;
  dbName?: string;
}

const mongoOptions: DbOptions = {
  socketTimeoutMS: 0,
  keepAlive: true,
  useNewUrlParser: true,
  dbName: 'tokyo-capital'
};

const initDB = async (config: Config) => {
  let client = await MongoClient.connect(config.MONGO_URL, mongoOptions);
  return client.db('tokyo-capital');
};

export default initDB;
