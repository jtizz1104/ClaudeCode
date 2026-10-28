import https from 'node:https';
import { URLS } from './constants.js';
import { escapar } from './xml.js';
import { firmarXml } from './firma.js';

const NS = 'http://ekuatia.set.gov.py/sifen/xsd';

const sobre = (cuerpo) =>
  '<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope"><env:Header/>' +
  `<env:Body>${cuerpo}</env:Body></env:Envelope>`;

const sinDeclaracion = (xml) => xml.replace(/^<\?xml[^>]*\?>\s*/, '');

function tag(xml, nombre) {
  const m = new RegExp(`<(?:\\w+:)?${nombre}>([\\s\\S]*?)</(?:\\w+:)?${nombre}>`).exec(xml);
  return m ? m[1].trim() : null;
}

function tags(xml, nombre) {
  return [...xml.matchAll(new RegExp(`<(?:\\w+:)?${nombre}>([\\s\\S]*?)</(?:\\w+:)?${nombre}>`, 'g'))].map((m) => m[1]);
}

// POST SOAP 1.2 con autenticación TLS mutua usando el certificado del contribuyente.
function enviar(url, cuerpo, credenciales, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        key: credenciales.clave,
        cert: credenciales.certificado,
        headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
        timeout: timeoutMs,
      },
      (res) => {
        let datos = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (datos += c));
        res.on('end', () => resolve({ status: res.statusCode, cuerpo: datos }));
      },
    );
    req.on('timeout', () => req.destroy(new Error('Tiempo de espera agotado con el SIFEN')));
    req.on('error', reject);
    req.end(sobre(cuerpo));
  });
}

function leerRespuesta(cuerpo) {
  const mensajes = tags(cuerpo, 'gResProc').map((g) => ({ codigo: tag(g, 'dCodRes'), mensaje: tag(g, 'dMsgRes') }));
  return {
    estado: tag(cuerpo, 'dEstRes'),
    protocolo: tag(cuerpo, 'dProtAut'),
    codigo: mensajes[0]?.codigo || tag(cuerpo, 'dCodRes'),
    mensaje: mensajes[0]?.mensaje || tag(cuerpo, 'dMsgRes'),
    mensajes,
    crudo: cuerpo,
  };
}

const idPedido = () => String(Date.now()).slice(-12);

// siRecepDE: envío sincrónico de un DE firmado.
export async function recibirDE(xmlFirmado, credenciales, ambiente) {
  const cuerpo = `<rEnviDe xmlns="${NS}"><dId>${idPedido()}</dId><xDE>${sinDeclaracion(xmlFirmado)}</xDE></rEnviDe>`;
  const res = await enviar(URLS[ambiente].recibe, cuerpo, credenciales);
  return leerRespuesta(res.cuerpo);
}

// siConsDE: consulta de un DE por CDC.
export async function consultarDE(cdc, credenciales, ambiente) {
  const cuerpo = `<rEnviConsDeRequest xmlns="${NS}"><dId>${idPedido()}</dId><dCDC>${cdc}</dCDC></rEnviConsDeRequest>`;
  const res = await enviar(URLS[ambiente].consulta, cuerpo, credenciales);
  const r = leerRespuesta(res.cuerpo);
  return { ...r, estado: r.estado || tag(res.cuerpo, 'dMsgRes') };
}

// Arma y firma el evento de cancelación (solo dentro de las 48 h de aprobado).
export function xmlEventoCancelacion(cdc, motivo, fecha, credenciales) {
  const rEve =
    `<rEve Id="1"><dFecFirma>${fecha}</dFecFirma><dVerFor>150</dVerFor>` +
    `<gGroupTiEvt><rGeVeCan><Id>${cdc}</Id><mOtEve>${escapar(motivo)}</mOtEve></rGeVeCan></gGroupTiEvt></rEve>`;
  const { xml } = firmarXml(`<rGesEve xmlns="${NS}">${rEve}</rGesEve>`, credenciales, 'rEve');
  return xml;
}

// siRecepEvento: envío de un evento del emisor.
export async function enviarEvento(xmlEvento, credenciales, ambiente) {
  const sinNs = xmlEvento.replace(` xmlns="${NS}"`, '');
  const cuerpo =
    `<rEnviEventoDe xmlns="${NS}"><dId>${idPedido()}</dId>` +
    `<dEvReg><gGroupGesEve>${sinNs}</gGroupGesEve></dEvReg></rEnviEventoDe>`;
  const res = await enviar(URLS[ambiente].evento, cuerpo, credenciales);
  return leerRespuesta(res.cuerpo);
}

export const _interno = { tag, tags, leerRespuesta };
