export default class TokenController {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  async store(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: ['Valores inválidos'],
        });
      }

      const user = await this.tokenService.verifyIfUserIsValid(email);
      if (!user) {
        return res.status(400).json({
          error: 'Usuário invalido',
        });
      }

      const verifyPass = await this.tokenService.verifyUserPassword(user, password);
      if (!verifyPass) {
        return res.status(400).json({
          error: 'Senha invalida',
        });
      }

      delete user.password_hash;
      const userdata = {
        id: user.id,
        email: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        userCompany: user.userCompany,
        permission: user.permission,
      };
      const { id } = user;
      const token = await this.tokenService.generateToken(id, email);

      return res.json({
        token,
        user: userdata,
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        error: `Ocorreu um erro inesperado ao logar: ${e.message}`,
      });
    }
  }

  async logado(req, res) {
    try {
      const { token } = req.body;

      const { email } = this.tokenService.verifyToken(token);

      const user = await this.tokenService.verifyIfUserIsValid(email);

      if (!user) {
        return res.status(400).json({
          error: 'Usuário invalido',
        });
      }

      const userdata = {
        id: user.id,
        email: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        userCompany: user.userCompany,
        permission: user.permission,
      };

      return res.status(200).json({
        ...userdata,
      });
    } catch (e) {
      return res.status(400).json({
        error: `Ocorreu um erro inesperado, o verificar token: ${e.message}`,
      });
    }
  }
}
