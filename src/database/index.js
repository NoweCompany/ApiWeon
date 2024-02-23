import dotenv from 'dotenv';

import MongoDbConnection from './MongoDbConnection.js';
import SequelizeConnection from './MysqlConnection.js';

import conectionConfig from '../config/connectionConfig.js';

dotenv.config();

const sequelizeInstance = new SequelizeConnection(conectionConfig);
const mongoInstance = new MongoDbConnection(process.env.MONGO_CONNECTION_STRING);

function testConnections() {
  Promise.all([sequelizeInstance.virifyConect(), mongoInstance.virifyConect()])
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
}


export { sequelizeInstance, mongoInstance, testConnections };
