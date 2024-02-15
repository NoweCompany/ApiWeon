const typesChartsAllowed = {
  pie: 'Setor', line: 'Linha', area: 'Area', column: 'Coluna',
};
export default class ChartsController {
  constructor(mongoDbValidation, chartsService, fieldsConfigService) {
    this.mongoDbValidation = mongoDbValidation
    this.chartsService = chartsService
    this.fieldsConfigService = fieldsConfigService
  }
  async store(req, res) {
    try {
      const {
        dashboardName, name, preset, textField, numberField, typeChart,
      } = req.body;

      const collectionNameFormated = `dashboard_${(dashboardName.toLowerCase().trim()).split(' ').join('_')}`;

      if (!dashboardName || !name || !preset || !textField || !numberField || !typeChart) {
        return res.status(400).json({
          errors: 'Envie os valores corretos',
        });
      }
      if (!Object.keys(typesChartsAllowed).includes(typeChart)) {
        return res.status(400).json({
          errors: `O tipo de gráfico '${typeChart}' não é permitido!`,
        });
      }

      const databasename = req.company
      const existDash = await this.mongoDbValidation.existCollection(databasename, collectionNameFormated)
      const existCollection = await this.mongoDbValidation.existCollection(databasename, preset)

      if (!existCollection || !existDash) {
        return res.status(400).json({ error: 'Essa collection não existe' });
      }

      //rules
      const rulesOfpreset = await this.fieldsConfigService.listFields(databasename, preset);

      const isValidRules = this.chartsService.verifyIFIsValidRules(rulesOfpreset, textField, numberField)
      if (!isValidRules) {
        return res.status(400).json({
          errors: 'Os parametros enviados não satisfagem as regras de negocio, textField deve ser um campo tipo string e numberField deve ser um campo do tipo long ou double',
        });;
      }

      const originalNameTextField = this.chartsService.fieldOriginalName(rulesOfpreset, textField)
      const originalNameNumberField = this.chartsService.fieldOriginalName(rulesOfpreset, numberField)
      const dataInsert = {
        title: 'chart',
        name,
        preset,
        textField: originalNameTextField,
        numberField: originalNameNumberField,
        typeChart,
      }

      await this.chartsService.registerChart(databasename, collectionNameFormated, dataInsert)

      await req.historic.registerChange();
      return res.status(200).json(true);
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}
