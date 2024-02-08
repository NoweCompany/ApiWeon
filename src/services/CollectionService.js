class CollectionService {
  constructor(clientMongoDb, mongoDbValidation) {
    this.client = clientMongoDb;
    this.mongoDbValidation = mongoDbValidation;
  }

  async createNewCollection(dataBaseName, collectionName) {
    try {
      const database = this.client.db(dataBaseName);

      if (!collectionName) return { status: 400, msg: 'Envie os valores corretos' };

      const collections = (await database.listCollections().toArray()).map((vl) => vl.name);

      if (collections.includes(collectionName)) {
        return { status: 400, msg: 'Essa predefinição já existe' };
      }

      await database.createCollection(collectionName, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            title: `${collectionName} rule`,
            required: ['default', 'active'],
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
      });

      return { status: 200, msg: 'Predefinição criada com sucesso' };
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }
}

export default CollectionService;
