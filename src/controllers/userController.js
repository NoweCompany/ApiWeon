export default class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async store(req, res) {
    try {
      const { email, password, permission } = req.body;

      if (!this.userService.validateInput(email, password)) {
        return res.status(400).json({ errors: 'Valores inválidos' });
      }

      const emailExists = await this.userService.isEmailInUse(email);
      if (emailExists) {
        return res.status(400).json({ errors: 'Um usuário com esse email já existe' });
      }

      const userId = await this.userService.createUser(email, password, req.company, permission);
      delete req.body.password;

      return res.json({ userId, ...req.body });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ errors: 'Ocorreu um erro inesperado' });
    }
  }

  // Index
  async index(req, res) {
    try {
      const users = await this.userService.findUsersByCompany(req.company);
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ errors: 'Ocorreu um erro inesperado' });
    }
  }

  // Show
  async show(req, res) {
    try {
      if (!this.userService.validateInput(req.params.id)) {
        return res.status(400).json({ errors: 'Valores inválidos' });
      }
      const user = await this.userService.findUserById(req.params.id);

      const userdata = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        userCompany: user.userCompany,
        permission: user.permission,
      };
      return res.json({
        ...userdata,
      });
    } catch (error) {
      return res.status(500).json({ errors: 'Ocorreu um erro inesperado' });
    }
  }

  // Update
  async update(req, res) {
    try {
      const user = await this.userService.findUserById(req.userId);
      if (!user) {
        return res.status(400).json({
          error: 'Este usuário não existe',
        });
      }

      const { email, password } = req.body;

      const updatedUser = await this.userService.updateUserData(user, { email, password });

      const { id: newId, email: newEmail } = updatedUser;
      return res.json({ newId, newEmail });
    } catch (error) {
      return res.status(500).json({ errors: 'Ocorreu um erro inesperado' });
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

      const user = await this.userService.findUserById(req.params.id);
      if (!user) {
        return res.status(400).json({
          error: 'Este usuário não existe',
        });
      }

      const company = await this.userService.findCompanyByUserId(user.id);
      if (!company) {
        return res.status(400).json({
          error: 'Compania do usuário não encontrada ou inválida',
        });
      }

      const validateCompany = this.userService.validateCompany(company.name, req.company);
      if (!validateCompany) {
        return res.status(400).json({
          error: 'Você só pode excluir usuários que pertencem à mesma empresa que você',
        });
      }

      await user.destroy();

      return res.json('Usuário excluído com sucesso');
    } catch (error) {
      return res.status(500).json({ errors: 'Ocorreu um erro inesperado' });
    }
  }
}
