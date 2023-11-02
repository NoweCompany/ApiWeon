import Company from '../models/CompanysModel';
import Permission from '../models/PermissionsModel';
import User from '../models/UserModels';
import sequelize from '../database/index';

class UserController {
  async store(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        email, password, permission,
      } = req.body;
      const {
        adm,
        insert,
        edit,
        delet,
      } = permission;

      if (!email || !password) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }

      const emailExist = !!(await User.findOne({ where: { email } }));
      if (emailExist) {
        return res.status(400).json({
          errors: 'Um usuário com esse email já existe',
        });
      }
      const companyFormated = String(req.company).trim().toLowerCase();
      const newUser = await User.create({ email, password }, { transaction: t });
      const { id: userId } = newUser;

      await Company.create({
        name: companyFormated,
        company_user_id: userId,
      }, { transaction: t });

      await Permission.create({
        id: userId,
        adm,
        insert,
        edit,
        delet,
        user_id: userId,
      }, { transaction: t });

      await t.commit();
      delete req.body.password;

      return res.json(Object.assign(req.body, { userId }));
    } catch (e) {
      t.rollback();
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  // Index
  async index(req, res) {
    try {
      const { company } = req;
      const users = await User.findAll({
        include: [
          {
            model: Company,
            as: 'userCompany',
            where: { name: company },
          },
          {
            model: Permission,
            as: 'permission',
          },
        ],
        attributes: {
          exclude: [
            'password_hash',
          ],
        },
      });
      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  // Show
  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id);

      const { id, email } = user;
      return res.json({ id, email });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  // Update
  async update(req, res) {
    try {
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(400).json({
          errors: 'Usuário não existe',
        });
      }

      const { email, password } = req.body;

      const novosDados = await user.update({ email, password });
      const { newId, newEmail } = novosDados;
      return res.json({ newId, newEmail });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  // Delete
  async delete(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({
          errors: 'Valores inválidos',
        });
      }
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(400).json({
          errors: 'Usuário não existe',
        });
      }

      await user.destroy();
      return res.json(null);
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new UserController();
