import { MongoClient, ObjectId } from 'mongodb';

import dotenv from 'dotenv';

dotenv.config();

class Mongo {
  #database = null;

  constructor(database) {
    this.database = database;
    this.connection = null;
  }

  set database(databaseName) {
    this.#database = databaseName;
  }

  get database() {
    return this.#database;
  }

  async connect() {
    try {
      if (this.connection) return this.connection;
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
      this.connection = null;
    } catch (error) {
      throw new Error('Erro ao tentar fechar a conexão');
    }
  }

  async existCollection(collectionName, databaseName) {
    try {
      const database = databaseName || this.database;

      const databaseRef = this.connection.db(database);
      const arrayCollection = await databaseRef.listCollections().toArray();

      return arrayCollection.some((collection) => collection.name === collectionName);
    } catch (err) {
      console.log(err);
      throw new Error('Erro ao verificar a existência da coleção');
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
