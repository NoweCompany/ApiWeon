export default class KpiService {
  constructor(mongoInstance) {
    this.client = mongoInstance;
  }

  async registerKpi(databaseName, collectionName, value) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);

      await collection.insertOne(value);
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao registrar Kpi');
    }
  }

  verifyIFIsValidRules(rulesOfpreset, numberField) {
    for (let field of rulesOfpreset) {
      const fieldName = field.key;
      const fieldType = field.type;
      if (fieldName === numberField) return true;

      if (fieldName === numberField && (fieldType !== 'long' && fieldType !== 'double')) {
        return false
      }
    }

    return false
  }

  fieldOriginalName(rulesOfpreset, fieldName) {
    const { originalName } = rulesOfpreset.find((field) => field.key === fieldName)
    return originalName
  }
}
