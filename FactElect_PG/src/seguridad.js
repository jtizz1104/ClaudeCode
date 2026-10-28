import { scryptSync, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function hashPassword(password) {
  const sal = randomBytes(16);
  const hash = scryptSync(password, sal, 64);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

export function verificarPassword(password, guardado) {
  const [sal, hash] = guardado.split(':');
  const calculado = scryptSync(password, Buffer.from(sal, 'hex'), 64);
  return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

export const nuevoToken = () => randomBytes(32).toString('hex');

// Clave maestra para cifrar la contraseña del certificado y el CSC en la base.
// Se toma de APP_SECRET o se genera una vez junto a la base de datos.
let claveMaestra;
function clave() {
  if (claveMaestra) return claveMaestra;
  let secreto = process.env.APP_SECRET;
  if (!secreto) {
    const ruta = process.env.SECRET_PATH || 'data/secret.key';
    if (!existsSync(ruta)) {
      mkdirSync(dirname(ruta), { recursive: true });
      writeFileSync(ruta, randomBytes(32).toString('hex'), { mode: 0o600 });
    }
    secreto = readFileSync(ruta, 'utf8').trim();
  }
  claveMaestra = scryptSync(secreto, 'factelect-pg', 32);
  return claveMaestra;
}

export function cifrar(texto) {
  if (texto === null || texto === undefined || texto === '') return null;
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', clave(), iv);
  const datos = Buffer.concat([c.update(String(texto), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), datos].map((b) => b.toString('base64')).join('.');
}

export function descifrar(cifrado) {
  if (!cifrado) return null;
  const [iv, tag, datos] = cifrado.split('.').map((s) => Buffer.from(s, 'base64'));
  const d = createDecipheriv('aes-256-gcm', clave(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(datos), d.final()]).toString('utf8');
}
