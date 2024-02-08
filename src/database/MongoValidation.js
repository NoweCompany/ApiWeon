import { ObjectId } from 'mongodb';

class MongoValidation {
  #database = null;

  constructor(database, connection) {
    this.database = database;
    this.connection = connection;
  }

  set database(databaseName) {
    this.#database = databaseName;
  }

  get database() {
    return this.#database;
  }

  async existDb(databaseName) {
    try {
      const databasesList = (await this.connection.db().admin().listDatabases()).databases.map((vl) => vl.name);

      const exist = databasesList.includes(databaseName);

      return exist;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao verificar se o bancos de dados existe');
    }
  }

  async existCollection(collectionName, databaseName) {
    try {
      const database = databaseName || this.database;

      const databaseRef = this.connection.db(database);
      const arrayCollection = await databaseRef.listCollections().toArray();

      return arrayCollection.some((collection) => collection.name === collectionName);
    } catch (err) {
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

export default MongoValidation;
