import User from '../models/UserModels';
import Permission from '../models/PermissionsModel';

class PermissionController {
  async store(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          errors: 'Id inválido',
        });
      }

      const {
        adm,
        insert,
        edit,
        delet,
      } = req.body;

      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(400).json({
          errors: 'Usuário não existe',
        });
      }

      const permission = await Permission.findByPk(userId);

      if (permission) {
        return res.status(400).json({
          errors: 'este usuario já possui uma permissão',
        });
      }

      const newPermission = await Permission.create({
        id: userId,
        adm,
        insert,
        edit,
        delet,
        user_id: userId,
      });

      return res.status(200).json({ newPermission });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async show(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          errors: 'Id inválido',
        });
      }

      const users = await User.findByPk(userId, {
        attributes: ['id', 'email'],
        include: {
          attributes: { exclude: ['id', 'user_id'] },
          association: 'permission',
        },
      });

      return res.status(200).json(users);
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email'],
        include: {
          attributes: { exclude: ['id', 'user_id'] },
          association: 'permission',
        },
      });

      return res.status(200).json(users);
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }

  async update(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          errors: 'Id inválido',
        });
      }

      const {
        adm,
        insert,
        edit,
        delet,
      } = req.body;

      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(400).json({
          errors: 'Usuário não existe',
        });
      }

      const permission = await Permission.findByPk(userId);

      if (!permission) {
        return res.status(400).json({
          errors: 'este usuario não possui uma permissão',
        });
      }

      const newPermission = await permission.update({
        adm,
        insert,
        edit,
        delet,
      });

      return res.status(200).json({ newPermission });
    } catch (e) {
      return res.status(400).json({
        errors: 'Ocorreu um erro inesperado',
      });
    }
  }
}

export default new PermissionController();
