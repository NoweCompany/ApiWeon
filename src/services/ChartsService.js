export default class ChartService {
  constructor(mongoInstance) {
    this.client = mongoInstance;
  }

  async registerChart(databaseName, collectionName, value) {
    try {
      const collection = this.client.db(databaseName).collection(collectionName);

      await collection.insertOne(value);
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao registrar grafico');
    }
  }

  verifyIFIsValidRules(rulesOfpreset, textField, numberField) {
    let textFieldExist = false;
    let numberFieldExist = false;

    for (let field of rulesOfpreset) {
      const fieldName = field.key;
      const fieldType = field.type;

      if (fieldName === textField) textFieldExist = true;
      if (fieldName === numberField) numberFieldExist = true;

      if (fieldName === textField && fieldType !== 'string') {
        //'A propriedade textField deve ser um campo de tipo string'
        return false
      }
      if (fieldName === numberField && (fieldType !== 'long' && fieldType !== 'double')) {
        //'A propriedade numberField deve ser um campo de tipo double ou int'
        return false
      }
    }
    if (!textFieldExist || !numberFieldExist) {
      return false
    }

    return true
  }

  fieldOriginalName(rulesOfpreset, fieldName) {
    const { originalName } = rulesOfpreset.find((field) => field.key === fieldName)
    return originalName
  }
}
