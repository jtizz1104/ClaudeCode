import { randomInt } from 'node:crypto';
import { calcularDV } from './dv.js';

const pad = (v, n) => String(v).padStart(n, '0');

// Código de Control (CDC) de 44 dígitos:
// tipo(2) ruc(8) dv(1) est(3) pe(3) número(7) tipoContrib(1) fecha(8) tipoEmisión(1) codSeg(9) dv(1)
export function generarCDC({ tipo, ruc, dvRuc, establecimiento, puntoExp, numero, tipoContribuyente, fecha, tipoEmision = 1, codigoSeguridad }) {
  const ymd = fecha.slice(0, 10).replace(/-/g, '');
  const base =
    pad(tipo, 2) +
    pad(ruc, 8) +
    String(dvRuc) +
    pad(establecimiento, 3) +
    pad(puntoExp, 3) +
    pad(numero, 7) +
    String(tipoContribuyente) +
    ymd +
    String(tipoEmision) +
    pad(codigoSeguridad, 9);
  if (base.length !== 43) throw new Error(`CDC base inválida (${base.length} dígitos)`);
  return base + calcularDV(base);
}

export function codigoSeguridad() {
  return pad(randomInt(1, 999999999), 9);
}

export function descomponerCDC(cdc) {
  return {
    tipo: Number(cdc.slice(0, 2)),
    ruc: cdc.slice(2, 10).replace(/^0+/, ''),
    dvRuc: Number(cdc[10]),
    establecimiento: cdc.slice(11, 14),
    puntoExp: cdc.slice(14, 17),
    numero: cdc.slice(17, 24),
    tipoContribuyente: Number(cdc[24]),
    fecha: `${cdc.slice(25, 29)}-${cdc.slice(29, 31)}-${cdc.slice(31, 33)}`,
    tipoEmision: Number(cdc[33]),
    codigoSeguridad: cdc.slice(34, 43),
    dv: Number(cdc[43]),
  };
}

export function cdcValido(cdc) {
  return /^\d{44}$/.test(cdc) && calcularDV(cdc.slice(0, 43)) === Number(cdc[43]);
}
