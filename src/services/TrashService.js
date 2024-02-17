export default class TrashService {
  constructor(client, convertTypeToBsonType) {
    this.client = client;
    this.convertTypeToBsonType = convertTypeToBsonType;
  }

  async listItemsAllTrash(databaseName, collections, limit) {
    try {
      const databaseRef = this.client.db(databaseName);

      const valuesOnTrash = await Promise.all(collections.map(async (collection) => {
        const values = await databaseRef.collection(collection).find({ active: false }, { projection: { default: 0, active: 0 } }).limit(Number(limit)).toArray();
        if (values.length > 0) {
          return { collectionName: collection, values };
        }
      }));

      return valuesOnTrash.filter(Boolean); // Remove valores undefined
    } catch (error) {
      throw new Error(`Erro ao listar todos os itens na lixeira: ${error.message}`);
    }
  }

  async listItemsInTrash(databaseName, collectionName, limit) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);
      const values = await collection.find({ active: false }, { projection: { default: 0, active: 0 } }).limit(Number(limit)).toArray();
      return values;
    } catch (error) {
      console.error('Erro ao listar itens na lixeira:', error);
      throw new Error('Erro ao listar itens na lixeira:');
    }
  }

  async restoreValue(databaseName, collectionName, id) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);
      const objectId = this.convertTypeToBsonType('id', id);
      await collection.updateOne(
        { _id: objectId },
        { $set: { active: true } },
      );
    } catch (error) {
      throw new Error(`Erro ao restaurar valor: ${error.message}`);
    }
  }
}
