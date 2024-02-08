import jwt from 'jsonwebtoken';
import User from '../models/UserModels';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: 'Login required, user not Authorized!!',
    });
  }

  const [, token] = authorization.split(' ');

  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = decodedToken;

    const user = await User.findOne({
      where: { id, email },
      attributes: {
        exclude: ['password_hash'],
      },
      include: 'userCompany',
    });

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário inválido'],
      });
    }
    const company = user.userCompany.dataValues.name;

    if (!company) {
      return res.status(401).json({
        errors: 'Empresa inválida',
      });
    }

    req.userId = id;
    req.userEmail = email;
    req.company = company;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ errors: 'Erro ao verificar token' });
  }
};
