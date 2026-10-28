import { calcularDocumento } from './sifen/calc.js';
import { construirDE } from './sifen/xml.js';
import { codigoSeguridad } from './sifen/cdc.js';
import { firmarXml, leerP12, certificadoDePrueba } from './sifen/firma.js';
import { urlQR, insertarQR } from './sifen/qr.js';
import { recibirDE, consultarDE, xmlEventoCancelacion, enviarEvento } from './sifen/soap.js';
import { TIPOS_DE } from './sifen/constants.js';
import { transaccion } from './db.js';
import { cifrar, descifrar } from './seguridad.js';
import { plan } from './planes.js';

export class ErrorNegocio extends Error {
  constructor(mensaje, status = 422) {
    super(mensaje);
    this.status = status;
  }
}

// Fecha y hora local de Paraguay (UTC-3 permanente desde 2024) en formato SIFEN.
export function fechaPY(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Asuncion', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

export function empresaXml(e) {
  return {
    ruc: e.ruc, dv: e.dv, razonSocial: e.razon_social, nombreFantasia: e.nombre_fantasia,
    tipoContribuyente: e.tipo_contribuyente, direccion: e.direccion, numCasa: e.num_casa,
    depCod: e.dep_cod, depDesc: e.dep_desc, ciuCod: e.ciu_cod, ciuDesc: e.ciu_desc,
    telefono: e.telefono, email: e.email, actEcoCod: e.act_eco_cod, actEcoDesc: e.act_eco_desc,
    timbrado: e.timbrado, timbradoInicio: e.timbrado_inicio,
    establecimiento: e.establecimiento, puntoExp: e.punto_exp,
  };
}

// Credenciales de firma. En modo simulado, si no hay certificado cargado, se
// genera uno autofirmado para poder mostrar el circuito completo.
export function credenciales(db, e) {
  if (!e.cert_p12) {
    if (e.ambiente !== 'simulado') throw new ErrorNegocio('Cargue su certificado digital (.p12) en Configuración');
    const pass = 'prueba';
    const p12 = certificadoDePrueba(e.razon_social.slice(0, 60));
    const info = leerP12(p12, pass);
    db.prepare('UPDATE empresas SET cert_p12 = ?, cert_pass = ?, cert_info = ? WHERE id = ?').run(
      p12, cifrar(pass), JSON.stringify({ titular: info.titular, validoHasta: info.validoHasta, prueba: true }), e.id,
    );
    e.cert_p12 = p12;
    e.cert_pass = cifrar(pass);
    return info;
  }
  return leerP12(Buffer.from(e.cert_p12), descifrar(e.cert_pass));
}

export function documentosDelMes(db, empresaId) {
  return db
    .prepare(
      `SELECT COUNT(*) AS n FROM documentos WHERE empresa_id = ? AND estado != 'rechazado'
       AND strftime('%Y-%m', creado) = strftime('%Y-%m', 'now')`,
    )
    .get(empresaId).n;
}

function resolverCliente(db, empresaId, entrada) {
  if (!entrada) throw new ErrorNegocio('Seleccione un cliente');
  if (entrada.id) {
    const c = db.prepare('SELECT * FROM clientes WHERE id = ? AND empresa_id = ?').get(entrada.id, empresaId);
    if (!c) throw new ErrorNegocio('Cliente inexistente', 404);
    return {
      contribuyente: !!c.contribuyente, ruc: c.ruc, dv: c.dv, tipoContribuyente: c.tipo_contribuyente,
      tipoDoc: c.tipo_doc, numDoc: c.num_doc, nombre: c.nombre, direccion: c.direccion,
      email: c.email, telefono: c.telefono, pais: c.pais, paisDesc: c.pais_desc,
      tipoOperacion: c.contribuyente ? 1 : c.pais === 'PRY' ? 2 : 4,
    };
  }
  // Consumidor final sin datos (innominado).
  return { contribuyente: false, tipoDoc: 5, numDoc: '0', nombre: 'Sin Nombre', tipoOperacion: 2 };
}

function siguienteNumero(db, e, tipo) {
  db.prepare(
    `INSERT INTO secuencias (empresa_id, tipo, establecimiento, punto_exp, ultimo) VALUES (?, ?, ?, ?, 0)
     ON CONFLICT DO NOTHING`,
  ).run(e.id, tipo, e.establecimiento, e.punto_exp);
  db.prepare(
    'UPDATE secuencias SET ultimo = ultimo + 1 WHERE empresa_id = ? AND tipo = ? AND establecimiento = ? AND punto_exp = ?',
  ).run(e.id, tipo, e.establecimiento, e.punto_exp);
  return db
    .prepare('SELECT ultimo FROM secuencias WHERE empresa_id = ? AND tipo = ? AND establecimiento = ? AND punto_exp = ?')
    .get(e.id, tipo, e.establecimiento, e.punto_exp).ultimo;
}

const estadoDesdeSifen = (r) =>
  /aprobado/i.test(r.estado || '') ? 'aprobado' : /rechazado/i.test(r.estado || '') ? 'rechazado' : 'pendiente';

async function transmitir(db, e, doc, cred) {
  let estado;
  let respuesta;
  if (e.ambiente === 'simulado') {
    estado = 'aprobado';
    respuesta = { estado: 'Aprobado', codigo: '0260', mensaje: 'Simulación: no se envió al SIFEN', protocolo: `SIM-${Date.now()}` };
  } else {
    try {
      const r = await recibirDE(doc.xml, cred, e.ambiente);
      estado = estadoDesdeSifen(r);
      respuesta = { estado: r.estado, codigo: r.codigo, mensaje: r.mensaje, protocolo: r.protocolo, mensajes: r.mensajes };
    } catch (err) {
      estado = 'pendiente';
      respuesta = { estado: 'Sin respuesta', mensaje: err.message };
    }
  }
  db.prepare('UPDATE documentos SET estado = ?, respuesta = ? WHERE id = ?').run(estado, JSON.stringify(respuesta), doc.id);

  // Un DE rechazado no existe para el SIFEN: si fue el último número, se libera.
  if (estado === 'rechazado') {
    db.prepare(
      `UPDATE secuencias SET ultimo = ultimo - 1 WHERE empresa_id = ? AND tipo = ? AND establecimiento = ?
       AND punto_exp = ? AND ultimo = ?`,
    ).run(e.id, doc.tipo, e.establecimiento, e.punto_exp, Number(doc.numero));
  }
  return { estado, respuesta };
}

// Emite un documento electrónico completo: valida plan y cupo, calcula,
// arma el XML, lo firma, agrega el QR, lo guarda y lo transmite al SIFEN.
export async function emitir(db, e, entrada) {
  const tipo = Number(entrada.tipo);
  const p = plan(e.plan);
  if (!TIPOS_DE[tipo]) throw new ErrorNegocio('Tipo de documento inválido');
  if (!p.tipos.includes(tipo)) throw new ErrorNegocio(`Su plan ${p.nombre} no incluye ${TIPOS_DE[tipo].corto}. Cambie de plan para habilitarlo.`, 403);
  if (documentosDelMes(db, e.id) >= p.documentosMes) {
    throw new ErrorNegocio(`Alcanzó el cupo de ${p.documentosMes} documentos de este mes`, 403);
  }
  if (!e.csc && e.ambiente !== 'simulado') throw new ErrorNegocio('Cargue el CSC entregado por la DNIT en Configuración');

  const moneda = tipo === 7 ? 'PYG' : entrada.moneda || 'PYG';
  const cliente = tipo === 4 ? null : resolverCliente(db, e.id, entrada.cliente);
  const items = (entrada.items || []).map((it) => ({
    codigo: it.codigo, descripcion: String(it.descripcion || '').trim(), cantidad: it.cantidad,
    precioUnitario: tipo === 7 ? 0 : it.precioUnitario, descuento: it.descuento || 0,
    ivaTipo: Number(it.iva) === 0 ? 3 : 1, iva: Number(it.iva), tipoCambio: it.tipoCambio,
  }));
  if (!items.length) throw new ErrorNegocio('Agregue al menos un ítem');
  if (items.some((it) => !it.descripcion)) throw new ErrorNegocio('Todos los ítems necesitan descripción');

  if (tipo === 5 || tipo === 6) {
    const cdc = entrada.asociado?.cdc;
    const ref = db.prepare('SELECT estado FROM documentos WHERE cdc = ? AND empresa_id = ?').get(cdc, e.id);
    if (ref && ref.estado !== 'aprobado') throw new ErrorNegocio('El documento asociado no está aprobado');
  }

  let calc;
  try {
    calc = calcularDocumento({
      tipo, moneda, condicionTipoCambio: entrada.condicionTipoCambio || 1, tipoCambio: entrada.tipoCambio, items,
    });
  } catch (err) {
    throw new ErrorNegocio(err.message);
  }

  const cred = credenciales(db, e);
  const fecha = fechaPY();

  const doc = transaccion(db, () => {
    const numero = siguienteNumero(db, e, tipo);
    const datos = {
      tipo, numero, fecha, codigoSeguridad: codigoSeguridad(), moneda,
      tipoTransaccion: entrada.tipoTransaccion || 1,
      condicionTipoCambio: calc.totales.condicionTipoCambio, tipoCambio: calc.totales.tipoCambio,
      cliente, clienteId: entrada.cliente?.id || null, condicion: entrada.condicion, asociado: entrada.asociado, motivo: entrada.motivo,
      remision: entrada.remision, autofactura: entrada.autofactura, observacion: entrada.observacion,
    };
    let construido;
    try {
      construido = construirDE(empresaXml(e), datos, calc);
    } catch (err) {
      throw new ErrorNegocio(err.message);
    }
    const firmado = firmarXml(construido.xml, cred);
    const receptor = cliente || { contribuyente: true, ruc: e.ruc };
    const t = calc.totales;
    const qr = urlQR({
      cdc: construido.cdc, fechaEmision: fecha, receptor,
      totalGeneral: tipo === 7 ? 0 : t.totalGeneral, totalIva: tipo === 7 || tipo === 4 ? 0 : t.totalIva,
      cantidadItems: calc.items.length, digestValue: firmado.digestValue,
      idCSC: e.id_csc || '0001', csc: descifrar(e.csc) || 'SIMULADO', ambiente: e.ambiente,
    });
    const xml = insertarQR(firmado.xml, qr);
    const guardado = { ...datos, items: calc.items, totales: t };
    const r = db
      .prepare(
        `INSERT INTO documentos (empresa_id, tipo, numero, cdc, fecha, moneda, tipo_cambio, cliente_nombre,
           total, total_gs, datos, xml, qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      )
      .run(
        e.id, tipo, String(numero).padStart(7, '0'), construido.cdc, fecha, moneda, t.tipoCambio,
        tipo === 4 ? entrada.autofactura?.vendedor?.nombre : cliente.nombre,
        t.totalGeneral || 0, t.totalGs ?? t.totalGeneral ?? 0, JSON.stringify(guardado), xml, qr,
      );
    return { id: Number(r.lastInsertRowid), tipo, numero: String(numero).padStart(7, '0'), xml };
  });

  await transmitir(db, e, doc, cred);
  return db.prepare('SELECT * FROM documentos WHERE id = ?').get(doc.id);
}

export async function reenviar(db, e, doc) {
  if (doc.estado !== 'pendiente') throw new ErrorNegocio('Solo se reenvían documentos pendientes');
  await transmitir(db, e, doc, credenciales(db, e));
  return db.prepare('SELECT * FROM documentos WHERE id = ?').get(doc.id);
}

export async function consultar(db, e, doc) {
  if (e.ambiente === 'simulado') return { estado: doc.estado, mensaje: 'Modo simulado: estado local' };
  const r = await consultarDE(doc.cdc, credenciales(db, e), e.ambiente);
  return { estado: r.estado, codigo: r.codigo, mensaje: r.mensaje };
}

// Cancelación por evento: el SIFEN la admite dentro de las 48 h de aprobado el DE.
export async function cancelar(db, e, doc, motivo) {
  if (doc.estado !== 'aprobado') throw new ErrorNegocio('Solo se cancelan documentos aprobados');
  if (!motivo || motivo.trim().length < 5) throw new ErrorNegocio('Indique el motivo (mínimo 5 caracteres)');
  const horas = (Date.now() - new Date(doc.creado + 'Z').getTime()) / 3600000;
  if (horas > 48) throw new ErrorNegocio('Pasaron más de 48 h: corresponde emitir una nota de crédito');

  const cred = credenciales(db, e);
  const evento = xmlEventoCancelacion(doc.cdc, motivo.trim(), fechaPY(), cred);
  let respuesta;
  if (e.ambiente === 'simulado') {
    respuesta = { estado: 'Aprobado', mensaje: 'Simulación: cancelación registrada localmente' };
  } else {
    const r = await enviarEvento(evento, cred, e.ambiente);
    if (!/aprobado/i.test(r.estado || '')) throw new ErrorNegocio(`El SIFEN rechazó la cancelación: ${r.mensaje || r.estado}`);
    respuesta = { estado: r.estado, codigo: r.codigo, mensaje: r.mensaje };
  }
  const previa = JSON.parse(doc.respuesta || '{}');
  db.prepare("UPDATE documentos SET estado = 'cancelado', respuesta = ? WHERE id = ?").run(
    JSON.stringify({ ...previa, cancelacion: { ...respuesta, motivo, evento } }), doc.id,
  );
  return db.prepare('SELECT * FROM documentos WHERE id = ?').get(doc.id);
}
