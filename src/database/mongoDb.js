import { MongoClient, ObjectId } from 'mongodb';

import dotenv from 'dotenv';

dotenv.config();

class Mongo {
  constructor(database) {
    this.database = database;
    this.connection = null;
  }

  async connect() {
    if (!this.database) {
      return null;
    }
    try {
      const client = new MongoClient(`${process.env.MONGO_CONNECTION_STRING}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      this.connection = client;

      return this.connection;
    } catch (error) {
      throw new Error(error);
    }
  }

  async existDb(databaseName) {
    try {
      if (!this.connection) return;
      const databasesList = (await this.connection.db().admin().listDatabases()).databases.map((vl) => vl.name);

      const exist = databasesList.includes(databaseName);
      if (!exist) throw new Error('O bancos de dados q ue vc esta tentando acessar não existe');

      return exist;
    } catch (error) {
      throw new Error('O bancos de dados q ue vc esta tentando acessar não existe');
    }
  }

  close() {
    try {
      this.connection.close();
    } catch (error) {
      throw new Error('Erro ao tentar fechar a conexão');
    }
  }

  async existCollection(collectionName) {
    try {
      const collections = (await this.connection.db(this.database).listCollections().toArray()).map((collec) => collec.name);

      if (collections.includes(collectionName)) return true;
      return false;
    } catch (err) {
      throw new Error('A collection não exite');
    }
  }

  async existValue(id, collectionName) {
    const filter = { _id: new ObjectId(id) };

    const conter = await this.connection.db(this.database).collection(collectionName).countDocuments(
      filter,
      (err) => {
        throw new Error(err);
      },
    );

    if (conter <= 0) {
      return false;
    }

    return true;
  }
}

export default Mongo;
