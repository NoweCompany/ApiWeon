import jwt from 'jsonwebtoken';
import User from '../models/UserModels';
import Company from '../models/CompanysModel';
import Permission from '../models/PermissionsModel';

class TokenController {
  async store(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          errors: ['Valores inválidos'],
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({
          errors: ['Usuario não existe'],
        });
      }

      if (!(await user.passwordIsValid(password))) {
        return res.status(401).json({
          errors: ['Senha inválida'],
        });
      }
      const { id, nome } = user;
      const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION,
      });

      const userCompany = await Company.findOne({ where: { company_user_id: id } });
      const companyUser = await Company.findOne({ where: { company_user_id: id } });
      const permissionData = await Permission.findOne({ where: { user_id: id } });

      if (!companyUser) {
        return res.status(401).json({
          errors: 'Usuário não está associado a uma compania.',
        });
      }
      return res.json({
        token,
        user: {
          nome, id, email, idCompany: userCompany.id, nameCompany: userCompany.name,
        },
        companyUser,
        permissionData,
      });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async logado(req, res) {
    try {
      const { token } = req.body;

      const dados = jwt.verify(token, process.env.TOKEN_SECRET);
      const { id, email } = dados;

      const user = await User.findOne({ where: id, email });
      const { createdAt, updatedAt } = user;
      if (!user) {
        return res.status(401).json({
          errors: ['Usuário inválido'],
        });
      }

      const companyUser = await Company.findOne({ where: { company_user_id: id } });
      const permissionData = await Permission.findOne({ where: { user_id: id } });
      return res.status(200).json({
        id,
        email,
        createdAt,
        updatedAt,
        companyUser,
        permissionData,
      });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new TokenController();
