import multer from 'multer';
import path from 'path';

export default async function () {
  return {
    dest: path.resolve(__dirname, '..', '..', 'uploads'),
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '..', '..', 'uploads'));
      },
      fileName: `${Date.now()}_${'collectionName'}.xlsx`,
    }),
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/xml',
      ];

      if (allowedTypes.includes(file.mimeType)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file'));
      }
    },
  };
}
