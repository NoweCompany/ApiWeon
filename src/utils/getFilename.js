import { fileURLToPath } from 'url';

export default function getFilename(metaUrl) {
  const __filename = fileURLToPath(metaUrl);

  return __filename;
}
