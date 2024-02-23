class CollectionService {
  constructor(clientMongoDb, whiteList) {
    this.client = clientMongoDb;
    this.whiteList = whiteList;
  }

  async createNewCollection(dataBaseName, collectionName, schemaValidator) {
    try {
      const database = this.client.db(dataBaseName);

      let schema = schemaValidator
      if (!schema) schema = {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            title: `${collectionName} rule`,
            required: ['active'],
            properties: {
              active: {
                bsonType: 'bool',
                description: 'Campo para verificar o estado do documento',
              },
            },
          },
        },
        validationLevel: 'moderate',
        validationAction: 'error',
      }

      await database.createCollection(collectionName, schema);

      return true;
    } catch (err) {
      console.log(err);
      throw new Error('Ocorreu um erro enquanto era realizado a criação de uma predefinição');
    }
  }

  async listCollectionsInDatabase(databaseName, condicion) {
    try {
      const collections = await this.client.db(databaseName).listCollections({}).toArray();
      const collectionNames = collections.reduce((ac, cl) => {
        if (!this.whiteList.collections.includes(cl.name) && condicion(cl.name)) {
          ac.push(cl.name);
        }
        return ac;
      }, []);
      return collectionNames;
    } catch (error) {
      console.error(error);
      throw new Error(`Erro ao listar coleções: ${error.message}`);
    }
  }

  async deleteCollection(company, collectionName) {
    try {
      const database = this.client.db(company);
      if (this.whiteList.collections.includes(collectionName)) {
        throw new Error();
      }
      await database.dropCollection(collectionName);
    } catch (error) {
      throw new Error(`Erro ao excluir coleção '${collectionName}'`);
    }
  }

  isValidCollectionName(collectionName, newCollectionName) {
    if (this.whiteList.collections.includes(collectionName)
      || this.whiteList.collections.includes(newCollectionName)) {
      return false;
    }
    return true;
  }

  async renameCollection(databaseName, collectionName, newCollectionName) {
    try {
      const databaseRef = this.client.db(databaseName);

      await databaseRef.collection(collectionName).rename(newCollectionName);

      console.log(`Coleção ${collectionName} renomeada para ${newCollectionName}`);

      return true;
    } catch (error) {
      throw new Error(`Erro ao renomear tabela ${error.message}`);
    }
  }
}

export default CollectionService;
