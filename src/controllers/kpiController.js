const typesKPIsAllowed = {
  common: 'moda', totalSum: 'Soma total', average: 'Média',
};

export default class DashboardController {
  constructor(mongoDbValidation, kpiService, fieldsConfigService) {
    this.mongoDbValidation = mongoDbValidation
    this.kpiService = kpiService
    this.fieldsConfigService = fieldsConfigService
  }
  async store(req, res) {
    try {
      const {
        dashboardName, name, preset, numberField, typekpi,
      } = req.body;

      if (!dashboardName || !name || !preset || !numberField || !typekpi) {
        return res.status(400).json({
          error: 'Envie os valores corretos',
        });
      }

      const databasename = req.company
      const collectionNameFormated = `dashboard_${(dashboardName.toLowerCase().trim()).split(' ').join('_')}`;
      const existDash = await this.mongoDbValidation.existCollection(databasename, collectionNameFormated)
      const existCollection = await this.mongoDbValidation.existCollection(databasename, preset)

      if (!existCollection || !existDash) {
        return res.status(400).json({ error: 'Essa predefinição não existe' });
      }

      if (!Object.keys(typesKPIsAllowed).includes(typekpi))
        return res.status(400).json({
          error: `O tipo de indicador '${typekpi}' não é permitido!`,
        });

      const rulesOfpreset = await this.fieldsConfigService.listFields(databasename, preset);

      const numberFieldExist = this.kpiService.verifyIFIsValidRules(rulesOfpreset, numberField)
      if (!numberFieldExist) {
        return res.status(400).json({
          error: 'O campo selecionado não existem',
        });;
      }

      const originalName = this.kpiService.fieldOriginalName(rulesOfpreset, numberField)
      // insere os dados do body
      const dataInsert = {
        title: 'kpi',
        name,
        preset,
        numberField: originalName,
        typekpi,
      };

      await this.kpiService.registerKpi(databasename, collectionNameFormated, dataInsert)
      await req.historic.registerChange();
      return res.status(200).json(true);
    } catch (e) {
      return res.status(500).json({
        error: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}


