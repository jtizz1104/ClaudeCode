import { createHash } from 'node:crypto';
import { URLS, VERSION } from './constants.js';

const hex = (s) => Buffer.from(String(s), 'utf8').toString('hex');

// URL del código QR del KuDE (Manual Técnico v150, sección 13.8.4):
// los parámetros se concatenan en orden fijo, dFeEmiDE y DigestValue van en
// hexadecimal y cHashQR = SHA-256(parámetros + CSC).
export function urlQR({ cdc, fechaEmision, receptor, totalGeneral, totalIva, cantidadItems, digestValue, idCSC, csc, ambiente }) {
  const idRec = receptor.contribuyente ? `dRucRec=${receptor.ruc}` : `dNumIDRec=${receptor.numDoc || '0'}`;
  const params =
    `nVersion=${VERSION}&Id=${cdc}&dFeEmiDE=${hex(fechaEmision)}&${idRec}` +
    `&dTotGralOpe=${totalGeneral}&dTotIVA=${totalIva}&cItems=${cantidadItems}` +
    `&DigestValue=${hex(digestValue)}&IdCSC=${idCSC}`;
  const hash = createHash('sha256').update(params + csc).digest('hex');
  const base = (ambiente === 'prod' ? URLS.prod : URLS.test).qr;
  return `${base}${params}&cHashQR=${hash}`;
}

// El grupo gCamFuFD va después de la firma, como último hijo de rDE.
export function insertarQR(xmlFirmado, url) {
  const nodo = `<gCamFuFD><dCarQR>${url.replace(/&/g, '&amp;')}</dCarQR></gCamFuFD>`;
  return xmlFirmado.replace(/<\/rDE>\s*$/, `${nodo}</rDE>`);
}
