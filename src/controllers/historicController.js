export default class TableController {
  constructor(mongoDbValidation, valueService) {
    this.mongoDbValidation = mongoDbValidation
    this.valueService = valueService
  }
  async index(req, res) {
    try {
      const limit = req.params.limit || 100
      const databaseName = req.company
      const registers = await this.valueService.listAllDocuments(databaseName, 'historic', limit)
      if (registers.length <= 0) return res.status(200).json({ msg: 'Não há registros.' });

      return res.status(200).json({ registers });
    } catch (e) {
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params
      const databaseName = req.company

      if (!id) return res.status(400).json({ error: 'Id inválido' })
      const registers = await this.valueService.listDocumentById(databaseName, 'historic', id)

      if (!registers) return res.status(200).json({ msg: 'Esse registro não existe.' });

      return res.status(200).json(registers);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        errors: e.message || 'Ocorreu um erro inesperado',
      });
    }
  }
}


