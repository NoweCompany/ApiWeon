import dotenv from 'dotenv';

import MongoDbConnection from './MongoDbConnection';
import SequelizeConnection from './MysqlConnection';

import conectionConfig from '../config/connectionConfig';

dotenv.config();

const sequelizeInstance = new SequelizeConnection(conectionConfig);
const mongoInstance = new MongoDbConnection(process.env.MONGO_CONNECTION_STRING);

// const { client } = mongoInstance;
// client.on('connectionPoolCreated', (event) => {
//   console.log('Pool de conexões criado:', event);
// });

// client.on('connectionPoolReady', () => {
//   console.log('Pool de conexões pronto');
// });

// client.on('connectionPoolClosed', () => {
//   console.log('Pool de conexões fechado');
// });

// client.on('connectionCreated', (event) => {
//   console.log('Conexão criada:', event);
// });

// client.on('connectionReady', (event) => {
//   console.log('Conexão pronta:');
// });

// client.on('connectionClosed', (event) => {
//   console.log('Conexão fechada:', event);
// });

// client.on('connectionCheckOutStarted', () => {
//   console.log('Iniciando checkout de conexão');
// });

// client.on('connectionCheckOutFailed', (event) => {
//   console.log('Falha no checkout de conexão:', event);
// });

// client.on('connectionCheckedOut', () => {
//   console.log('Checkout de conexão concluído: a operação adquirio a conexão com sucesso');
// });

// client.on('connectionCheckedIn', (event) => {
//   console.log('Conexão devolvida ao pool:', event);
// });

// client.on('connectionPoolCleared', () => {
//   console.log('Pool de conexões limpo');
// });

function testConnections() {
  Promise.all([sequelizeInstance.virifyConect(), mongoInstance.virifyConect()])
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
}
export { sequelizeInstance, mongoInstance, testConnections };
