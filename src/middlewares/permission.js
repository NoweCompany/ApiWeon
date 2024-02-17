import Permission from '../models/PermissionsModel.js';

export default (permissionRequired) => async (req, res, next) => {
  const existPermission = await Permission.checksPermission(req.userId, permissionRequired);

  if (!existPermission) {
    return res.status(400).json({
      errors: `Este usuário não possui a permissão de ${permissionRequired}, necessária para realizar essa operação.`,
    });
  }

  next();
};
