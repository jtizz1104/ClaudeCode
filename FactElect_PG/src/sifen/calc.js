import { MONEDAS } from './constants.js';

// Decimales intermedios para bases e IVA por ítem (máximo que admite el SIFEN).
const DEC_PARCIAL = 8;

export function redondear(valor, decimales) {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
}

export function decimalesMoneda(moneda) {
  return MONEDAS[moneda]?.decimales ?? 2;
}

// Calcula ítems y totales de un documento según el Manual Técnico v150 (con NT13).
// Los precios unitarios se informan IVA incluido, como exige el SIFEN.
//
// doc: { tipo, moneda, condicionTipoCambio: 1 (global) | 2 (por ítem), tipoCambio,
//        items: [{ cantidad, precioUnitario, descuento, ivaTipo, iva, ivaProporcion, tipoCambio }] }
export function calcularDocumento(doc) {
  const moneda = doc.moneda || 'PYG';
  const dec = decimalesMoneda(moneda);
  const extranjera = moneda !== 'PYG';
  const condTiCam = extranjera ? Number(doc.condicionTipoCambio || 1) : null;
  const tipoCambio = extranjera && condTiCam === 1 ? Number(doc.tipoCambio) : null;
  const sinIva = Number(doc.tipo) === 4;

  if (extranjera && condTiCam === 1 && !(tipoCambio > 0)) {
    throw new Error(`Falta el tipo de cambio para ${moneda}`);
  }

  const items = (doc.items || []).map((it, i) => {
    const cantidad = Number(it.cantidad);
    const precio = Number(it.precioUnitario);
    const descuento = Number(it.descuento || 0);
    if (!(cantidad > 0)) throw new Error(`Ítem ${i + 1}: cantidad inválida`);
    if (!(precio >= 0)) throw new Error(`Ítem ${i + 1}: precio inválido`);
    if (descuento > precio) throw new Error(`Ítem ${i + 1}: el descuento supera al precio`);

    const totalBruto = redondear(precio * cantidad, dec);
    const totalOpe = redondear((precio - descuento) * cantidad, dec);
    const r = {
      ...it,
      cantidad,
      precioUnitario: precio,
      descuento,
      porcentajeDescuento: descuento > 0 ? redondear((descuento * 100) / precio, 2) : 0,
      totalBruto,
      totalOperacion: totalOpe,
    };

    if (extranjera && condTiCam === 2) {
      const tc = Number(it.tipoCambio);
      if (!(tc > 0)) throw new Error(`Ítem ${i + 1}: falta el tipo de cambio`);
      r.tipoCambio = tc;
      r.totalOperacionGs = redondear(totalOpe * tc, 0);
    }

    if (sinIva) return r;

    const ivaTipo = Number(it.ivaTipo || 1);
    const tasa = ivaTipo === 1 || ivaTipo === 4 ? Number(it.iva) : 0;
    const prop = ivaTipo === 1 ? 100 : ivaTipo === 4 ? Number(it.ivaProporcion ?? 100) : 0;
    if ((ivaTipo === 1 || ivaTipo === 4) && tasa !== 5 && tasa !== 10) {
      throw new Error(`Ítem ${i + 1}: la tasa de IVA debe ser 5 o 10`);
    }

    // NT13: base = [100 * EA008 * E733] / [10000 + (E734 * E733)]
    let base = 0;
    let liq = 0;
    let baseExenta = 0;
    if (ivaTipo === 1 || ivaTipo === 4) {
      base = redondear((100 * totalOpe * prop) / (10000 + tasa * prop), DEC_PARCIAL);
      liq = redondear((base * tasa) / 100, DEC_PARCIAL);
    }
    if (ivaTipo === 4) {
      baseExenta = redondear((100 * totalOpe * (100 - prop)) / (10000 + tasa * prop), DEC_PARCIAL);
    }
    return { ...r, ivaTipo, iva: tasa, ivaProporcion: prop, baseGravada: base, liquidacionIva: liq, baseExenta };
  });

  const suma = (fn) => items.reduce((acc, it) => acc + fn(it), 0);
  const t = {
    moneda,
    decimales: dec,
    condicionTipoCambio: condTiCam,
    tipoCambio,
    cantidadItems: items.length,
    totalDescuento: redondear(suma((it) => it.descuento * it.cantidad), dec),
    redondeo: 0,
  };

  if (sinIva) {
    t.totalOperacion = redondear(suma((it) => it.totalOperacion), dec);
  } else {
    const gravado = (tasa) => (it) =>
      it.iva !== tasa ? 0 : it.ivaTipo === 1 ? it.totalOperacion : it.baseGravada + it.liquidacionIva;
    t.subExento = redondear(suma((it) => (it.ivaTipo === 3 ? it.totalOperacion : 0) + it.baseExenta), dec);
    t.subExonerado = redondear(suma((it) => (it.ivaTipo === 2 ? it.totalOperacion : 0)), dec);
    t.sub5 = redondear(suma(gravado(5)), dec);
    t.sub10 = redondear(suma(gravado(10)), dec);
    t.totalOperacion = redondear(t.subExento + t.subExonerado + t.sub5 + t.sub10, dec);
    t.iva5 = redondear(suma((it) => (it.iva === 5 ? it.liquidacionIva : 0)), dec);
    t.iva10 = redondear(suma((it) => (it.iva === 10 ? it.liquidacionIva : 0)), dec);
    t.totalIva = redondear(t.iva5 + t.iva10, dec);
    t.baseGravada5 = redondear(suma((it) => (it.iva === 5 ? it.baseGravada : 0)), dec);
    t.baseGravada10 = redondear(suma((it) => (it.iva === 10 ? it.baseGravada : 0)), dec);
    t.totalBaseGravada = redondear(t.baseGravada5 + t.baseGravada10, dec);
  }
  t.totalGeneral = redondear(t.totalOperacion - t.redondeo, dec);

  if (extranjera) {
    t.totalGs =
      condTiCam === 1 ? redondear(t.totalGeneral * tipoCambio, 0) : redondear(suma((it) => it.totalOperacionGs), 0);
  }
  return { items, totales: t };
}

// Formato de montos para el XML: sin separador de miles, punto decimal y sin ceros sobrantes.
export function fmtXml(valor, decimales = DEC_PARCIAL) {
  const s = redondear(Number(valor || 0), decimales).toFixed(decimales);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}
