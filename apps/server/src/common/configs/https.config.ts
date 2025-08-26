import { readFileSync } from 'fs';
import { join } from 'path';

export const httpsOptions = {
  key: readFileSync(join(process.cwd(), 'ssl', 'private.key')),
  cert: readFileSync(join(process.cwd(), 'ssl', 'certificate.crt')),
  ca: readFileSync(join(process.cwd(), 'ssl', 'ca_bundle.crt')),
  
  // Дополнительные настройки безопасности
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-GCM-SHA384'
  ].join(':'),
  honorCipherOrder: true,
};