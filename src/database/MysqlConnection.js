import { Sequelize } from 'sequelize';
import User from '../models/UserModels';
import Permission from '../models/PermissionsModel';
import Company from '../models/CompanysModel';

class MysqlConnection {
  constructor(connectionConfig) {
    this.connection = new Sequelize(connectionConfig);
    this.connectionConfig = connectionConfig;
    this.initializationModels();
  }

  connect() {
    try {
      if (this.connection) {
        return console.log('Conexão já existe');
      }
      console.log('Conexão não existe e foi criada');
      this.connection = new Sequelize(this.connectionConfig);
    } catch (error) {
      return `conexão não encontrada ${error}`;
    }
  }

  async virifyConect() {
    try {
      await this.connection.authenticate();
      return 'Mysql: Connection has been established successfully.';
    } catch (error) {
      return `Mysql: Unable to connect to the database: ${error}`;
    }
  }

  initializationModels() {
    try {
      User.init(this.connection);
      Company.init(this.connection);
      Permission.init(this.connection);

      Permission.associate(this.connection.models);
      Company.associate(this.connection.models);
      User.associate(this.connection.models);
    } catch (error) {
      throw Error('Erro ao inicializar os model do sequelize');
    }
  }
}

export default MysqlConnection;
