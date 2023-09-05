import fs from 'fs';

export default async (req, res, next) => {
  try {
    const { filePath } = req;

    await setTimeout(async () => {
      await fs.unlinkSync(filePath);
    }, 10000);

    next();
  } catch (error) {
    next();
  }
};
