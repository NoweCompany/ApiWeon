import { ObjectId } from 'mongodb';

class MongoValidation {
  constructor(client) {
    this.client = client;
  }

  async existDb(databaseName) {
    try {
      const databasesList = (await this.client.db().admin().listDatabases()).databases.map((vl) => vl.name);

      const exist = databasesList.includes(databaseName);

      return exist;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao verificar se o bancos de dados existe');
    }
  }

  async existCollection(databaseName, collectionName) {
    try {
      const database = databaseName;
      const databaseRef = this.client.db(database);
      const arrayCollection = await databaseRef.listCollections().toArray();

      return arrayCollection.some((collection) => collection.name === collectionName);
    } catch (err) {
      console.log(err);
      throw new Error('Erro ao verificar a existência da coleção');
    }
  }

  async existValue(databaseName, collectionName, id) {
    const filter = { _id: new ObjectId(id) };

    const conter = await this.client.db(databaseName).collection(collectionName).countDocuments(
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
