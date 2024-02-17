import path from 'path';
import { getFilename } from './getFilename';

export default function getDirname(metaUrl) {
  const __dirname = path.dirname(getFilename(metaUrl));

  return __dirname;
}
