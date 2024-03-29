/* eslint-disable camelcase */
import Company from '../models/CompanysModel.js';
import User from '../models/UserModels.js';

class CompanyController {
  async store(req, res) {
    try {
      let { name } = req.body;
      const { company_user_id } = req.params;
      if (!name || !company_user_id) return res.status(400).json({ error: 'dados invalidos' });

      const user = await User.findOne({ where: { id: company_user_id } });

      if (!user) {
        return res.status(400).json({
          error: 'Usuário não existe',
        });
      }

      const company = await Company.findOne({ where: { company_user_id } });

      if (company) {
        return res.status(400).json({
          error: 'este usuario já possui uma compania',
        });
      }

      name = name.toLowerCase();

      const companyCreate = await Company.create({ name, company_user_id });

      return res.status(200).json({ companyCreate });
    } catch (e) {
      return res.status(400).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email'],
        include: {
          association: 'userCompany',
        },
      });

      return res.status(200).json(users);
    } catch (e) {
      return res.status(500).json({
        error: 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    return true;
  }

  async delete(req, res) {
    return true;
  }
}

export default new CompanyController();
