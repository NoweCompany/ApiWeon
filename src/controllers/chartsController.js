import MongoDb from '../database/MongoDbConnection';
import whiteList from '../config/whiteList';

async function getRules(dbName, collectionName, client) {
  const collection = client.db(dbName).collection(collectionName);

  const rule = await collection.options();
  let fields = [];

  if (Object.keys(rule).length <= 0) {
    throw new Error('Não há nenhum campo criado');
  }

  const { properties } = rule.validator.$jsonSchema;
  const { required } = rule.validator.$jsonSchema;

  fields = (Object.entries(properties)).reduce((accumulator, field) => {
    if (field[0] === 'default' || field[0] === 'active') return accumulator;
    const objFields = {};
    [objFields.key] = field;
    objFields.type = field[1].bsonType;
    objFields.required = !!(required.includes(field[0]));
    accumulator.push(objFields);
    return accumulator;
  }, []);

  return { collectionName, fields };
}

const typesChartsAllowed = {
  pie: 'Setor', line: 'Linha', area: 'Area', column: 'Coluna',
};

class DashboardController {
  async store(req, res) {
    const mongoDb = new MongoDb(req.company);
    const client = await mongoDb.connect();
    try {
      const {
        dashboardName, name, preset, textField, numberField, typeChart,
      } = req.body;

      const collectionNameFormated = `dashboard_${(dashboardName.toLowerCase().trim()).split(' ').join('_')}`;

      if (!dashboardName || !name || !preset || !textField || !numberField || !typeChart) throw new Error('Envie os valores corretos');
      if (!Object.keys(typesChartsAllowed).includes(typeChart)) throw new Error(`O tipo de gráfico '${typeChart}' não é permitido!`);
      if (!await mongoDb.existCollection(collectionNameFormated)) throw new Error(`O dashboard '${dashboardName}' não existe!`);
      if (!await mongoDb.existCollection(preset) || whiteList.collections.includes(preset)) throw new Error('Essa predefinição não existe!');

      const rulesOfpreset = await getRules(req.company, preset, client);

      let textFieldExist = false;
      let numberFieldExist = false;
      for (let field of rulesOfpreset.fields) {
        const fieldName = field.key;
        const fieldType = field.type;

        if (fieldName === textField) textFieldExist = true;
        if (fieldName === numberField) numberFieldExist = true;

        if (fieldName === textField && fieldType !== 'string') {
          throw new Error('A propriedade textField deve ser um campo de tipo string');
        }
        if (fieldName === numberField && (fieldType !== 'int' && fieldType !== 'double')) {
          throw new Error('A propriedade numberField deve ser um campo de tipo double ou int');
        }
      }
      if (!textFieldExist || !numberFieldExist) {
        throw new Error('Os campos selecionados não existem');
      }

      // insere os dados do body
      const dataBase = client.db(req.company);

      await dataBase.collection(collectionNameFormated).insertOne({
        title: 'chart', name, preset, textField, numberField, typeChart,
      });

      await req.historic.registerChange(client);
      return res.status(200).json(true);
    } catch (e) {
      return res.status(400).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    } finally {
      mongoDb.close();
    }
  }
}

export default new DashboardController();
