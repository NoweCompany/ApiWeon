import { MongoClient } from 'mongodb';

class MongoDbConnection {
  constructor(connectionString) {
    this.client = new MongoClient(`${connectionString}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.connectionString = connectionString;
  }

  async virifyConect() {
    try {
      const isConnected = await this.client.connect();
      if (isConnected) {
        return 'MongoDb: Connection has been established successfully.';
      }
      return 'MongoDb: Unable to connect to the mongodb';
    } catch (error) {
      return `MongoDb: Unable to connect to the mongodb: ${error}`;
    }
  }

  async connect() {
    try {
      if (this.client) {
        return console.log('Conexão já existe');
      }
      console.log('Conexão não existe e foi criada');
      this.client = new MongoClient(`${this.connectionString}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  close() {
    try {
      this.client.close();
      this.client = null;
    } catch (error) {
      throw new Error('Erro ao tentar fechar a conexão');
    }
  }
}

export default MongoDbConnection;
