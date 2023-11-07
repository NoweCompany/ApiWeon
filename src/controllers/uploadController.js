// import xlsx from 'xlsx';

class UploadController {
  async store(req, res) {
    const { collectionNamem, fileExtName } = req.params;
    console.log(req.files);
    const sheetClient = req.files.file;

    if (!collectionNamem || !fileExtName || !sheetClient) {
      return res.status(400).json({
        error: 'Valores passados por parametro inválidos',
      });
    }

    try {
      console.log(sheetClient);
      res.status(200).json({
        success: 'Upload bem sucedido',
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new UploadController();
