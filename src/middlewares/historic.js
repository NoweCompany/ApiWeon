import { mongoInstance } from '../database/index.js';
import MongoValidation from '../database/MongoValidation.js';

export default function historic(req, res, next) {
  const {
    userId, userEmail, company, method, url,
  } = req;

  if (!userId || !userEmail || !company || !method || !url) {
    res.status(401).json({
      errors: 'something went wrong, invalid values!',
    });
  }

  try {
    const historicObj = {
      userId,
      userEmail,
      company,
      method,
      registerChange: async () => {
        const { client } = mongoInstance;
        const mongoValidation = new MongoValidation(client);

        const database = client.db(company);

        const existCollection = await mongoValidation.existCollection(company, 'historic');
        if (!existCollection) {
          await database.createCollection('historic', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                title: 'historic rules',
                required: [
                  'default',
                  'active',
                  'method',
                  'userId',
                  'company',
                  'userEmail',
                  'route',
                  'currentDate'],
                properties: {
                  default: {
                    bsonType: 'int',
                    description: 'Default field',
                  },
                  active: {
                    bsonType: 'bool',
                    description: 'Boolena field used to check the document state',
                  },
                  method: {
                    bsonType: 'string',
                    description: 'Method request',
                  },
                  userId: {
                    bsonType: 'int',
                    description: 'User id',
                  },
                  company: {
                    bsonType: 'string',
                    description: 'User Company',
                  },
                  userEmail: {
                    bsonType: 'string',
                    description: 'User e-mail',
                  },
                  currentDate: {
                    bsonType: 'date',
                    description: 'current date',
                  },
                  route: {
                    bsonType: 'string',
                    description: 'Route of current request',
                  },
                  description: {
                    bsonType: 'string',
                    description: 'Descption',
                  },
                },
              },
            },
            validationLevel: 'moderate',
            validationAction: 'error',
          });
        }

        const route = (req.originalUrl).split('/')[1];
        const description = `User with e-mail ${userEmail}, performed an action in route "${route}" with the method "${method}"`;
        await database.collection('historic').insertOne({
          default: 0,
          active: true,
          method: String(method),
          userId: Number(userId),
          company: String(company),
          userEmail: String(userEmail),
          currentDate: new Date(),
          route: String(route),
          description,
        });
      },
    };

    req.historic = historicObj;
    next();
  } catch (error) {
    res.status(401).json({
      errors: 'Failed on register your update in historic, was not possible complet operation.',
    });
  }
}
