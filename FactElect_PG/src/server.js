import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { abrirDB, transaccion } from './db.js';
import { hashPassword, verificarPassword, nuevoToken, cifrar } from './seguridad.js';
import { PLANES, SETUP, plan } from './planes.js';
import { cotizaciones, guardarCotizacion, borrarCotizacion } from './cotizaciones.js';
import { emitir, reenviar, consultar, cancelar, documentosDelMes, ErrorNegocio } from './emision.js';
import { kudeHtml, enviarPorEmail } from './kude.js';
import { calcularDocumento } from './sifen/calc.js';
import { calcularDV } from './sifen/dv.js';
import { cdcValido } from './sifen/cdc.js';
import { leerP12 } from './sifen/firma.js';
import * as K from './sifen/constants.js';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const COOKIE = 'factelect_sesion';
const DURACION_SESION = 7 * 24 * 3600 * 1000;

const mal = (msg, status = 422) => new ErrorNegocio(msg, status);
const texto = (v, max = 255) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));

function leerCookie(req, nombre) {
  const par = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(nombre + '='));
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : null;
}

function validarEmpresa(e) {
  const out = {
    ruc: texto(e.ruc, 8).replace(/\D/g, ''),
    razon_social: texto(e.razonSocial),
    nombre_fantasia: texto(e.nombreFantasia) || null,
    tipo_contribuyente: Number(e.tipoContribuyente) === 2 ? 2 : 1,
    direccion: texto(e.direccion),
    num_casa: texto(e.numCasa, 6) || '0',
    dep_cod: Number(e.depCod) || 1,
    dep_desc: texto(e.depDesc, 16) || 'CAPITAL',
    ciu_cod: Number(e.ciuCod) || 1,
    ciu_desc: texto(e.ciuDesc, 36) || 'ASUNCION (DISTRITO)',
    telefono: texto(e.telefono, 15),
    email: texto(e.email, 80),
    act_eco_cod: texto(e.actEcoCod, 8),
    act_eco_desc: texto(e.actEcoDesc, 300),
    timbrado: texto(e.timbrado, 8).replace(/\D/g, ''),
    timbrado_inicio: texto(e.timbradoInicio, 10),
    establecimiento: texto(e.establecimiento, 3).padStart(3, '0') || '001',
    punto_exp: texto(e.puntoExp, 3).padStart(3, '0') || '001',
  };
  if (!out.ruc) throw mal('Ingrese el RUC');
  out.dv = calcularDV(out.ruc);
  if (e.dv !== undefined && e.dv !== '' && Number(e.dv) !== out.dv) throw mal(`El DV del RUC ${out.ruc} es ${out.dv}`);
  for (const [campo, nombre] of [
    ['razon_social', 'la razón social'], ['direccion', 'la dirección'], ['telefono', 'el teléfono'],
    ['email', 'el email'], ['act_eco_cod', 'el código de actividad económica'], ['act_eco_desc', 'la actividad económica'],
  ]) if (!out[campo]) throw mal(`Ingrese ${nombre}`);
  if (out.telefono.length < 6) throw mal('El teléfono debe tener al menos 6 dígitos');
  if (!/^\d{8}$/.test(out.timbrado)) throw mal('El timbrado tiene 8 dígitos');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.timbrado_inicio)) throw mal('Ingrese la fecha de inicio de vigencia del timbrado');
  return out;
}

function validarCliente(c) {
  const contribuyente = !!c.contribuyente;
  const out = {
    contribuyente: contribuyente ? 1 : 0,
    nombre: texto(c.nombre),
    direccion: texto(c.direccion) || null,
    email: texto(c.email, 80) || null,
    telefono: texto(c.telefono, 20) || null,
    pais: texto(c.pais, 3).toUpperCase() || 'PRY',
    pais_desc: texto(c.paisDesc, 60) || 'Paraguay',
    ruc: null, dv: null, tipo_contribuyente: 1, tipo_doc: null, num_doc: null,
  };
  if (!out.nombre) throw mal('Ingrese el nombre o razón social');
  if (contribuyente) {
    const [num, dv] = texto(c.ruc, 12).split('-');
    out.ruc = (num || '').replace(/\D/g, '');
    if (!out.ruc) throw mal('Ingrese el RUC del cliente');
    out.dv = calcularDV(out.ruc);
    if (dv !== undefined && Number(dv) !== out.dv) throw mal(`El DV correcto para ${out.ruc} es ${out.dv}`);
    out.tipo_contribuyente = Number(c.tipoContribuyente) === 2 ? 2 : 1;
  } else {
    out.tipo_doc = Number(c.tipoDoc) || 1;
    if (!K.TIPOS_ID[out.tipo_doc]) throw mal('Tipo de documento inválido');
    out.num_doc = texto(c.numDoc, 20);
    if (!out.num_doc) throw mal('Ingrese el número de documento');
  }
  return out;
}

function validarProducto(p) {
  const out = {
    codigo: texto(p.codigo, 50),
    descripcion: texto(p.descripcion, 2000),
    precio: Number(p.precio) || 0,
    moneda: K.MONEDAS[p.moneda] ? p.moneda : 'PYG',
    iva: [0, 5, 10].includes(Number(p.iva)) ? Number(p.iva) : 10,
  };
  if (!out.codigo || !out.descripcion) throw mal('Código y descripción son obligatorios');
  if (out.precio < 0) throw mal('El precio no puede ser negativo');
  return out;
}

const empresaPublica = (e) => ({
  id: e.id, ruc: e.ruc, dv: e.dv, razonSocial: e.razon_social, nombreFantasia: e.nombre_fantasia,
  tipoContribuyente: e.tipo_contribuyente, direccion: e.direccion, numCasa: e.num_casa,
  depCod: e.dep_cod, depDesc: e.dep_desc, ciuCod: e.ciu_cod, ciuDesc: e.ciu_desc,
  telefono: e.telefono, email: e.email, actEcoCod: e.act_eco_cod, actEcoDesc: e.act_eco_desc,
  timbrado: e.timbrado, timbradoInicio: e.timbrado_inicio, establecimiento: e.establecimiento,
  puntoExp: e.punto_exp, ambiente: e.ambiente, idCSC: e.id_csc, cscCargado: !!e.csc,
  certificado: e.cert_info ? JSON.parse(e.cert_info) : null, plan: e.plan,
});

const docResumen = (d) => ({
  id: d.id, tipo: d.tipo, numero: d.numero, cdc: d.cdc, fecha: d.fecha, moneda: d.moneda,
  tipoCambio: d.tipo_cambio, cliente: d.cliente_nombre, total: d.total, totalGs: d.total_gs,
  estado: d.estado, respuesta: d.respuesta ? JSON.parse(d.respuesta) : null, creado: d.creado,
});

export function crearApp(db = abrirDB()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    next();
  });

  function abrirSesion(res, usuarioId) {
    const token = nuevoToken();
    db.prepare('INSERT INTO sesiones (token, usuario_id, expira) VALUES (?, ?, ?)').run(token, usuarioId, Date.now() + DURACION_SESION);
    const seguro = process.env.COOKIE_SECURE === '1' ? '; Secure' : '';
    res.set('Set-Cookie', `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DURACION_SESION / 1000}${seguro}`);
  }

  function auth(req, res, next) {
    const token = leerCookie(req, COOKIE);
    const s = token && db.prepare('SELECT * FROM sesiones WHERE token = ? AND expira > ?').get(token, Date.now());
    if (!s) return res.status(401).json({ error: 'Inicie sesión' });
    req.usuario = db.prepare('SELECT id, empresa_id, email, nombre FROM usuarios WHERE id = ?').get(s.usuario_id);
    req.empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.usuario.empresa_id);
    req.token = token;
    next();
  }

  // Freno simple contra fuerza bruta en el login (por IP).
  const intentos = new Map();
  function limitarLogin(req, res, next) {
    const ip = req.ip;
    const ahora = Date.now();
    const r = (intentos.get(ip) || []).filter((t) => ahora - t < 15 * 60 * 1000);
    if (r.length >= 10) return res.status(429).json({ error: 'Demasiados intentos. Espere unos minutos.' });
    r.push(ahora);
    intentos.set(ip, r);
    next();
  }

  // ---------- Públicas ----------
  app.get('/api/catalogos', (req, res) => {
    res.json({
      tipos: K.TIPOS_DE, monedas: K.MONEDAS, tiposId: K.TIPOS_ID, tiposTransaccion: K.TIPOS_TRANSACCION,
      condiciones: K.CONDICION_OPERACION, tiposPago: K.TIPOS_PAGO, motivosNC: K.MOTIVOS_NC_ND,
      motivosRemision: K.MOTIVOS_REMISION, responsablesRemision: K.RESPONSABLES_REMISION,
      planes: PLANES, setup: SETUP,
    });
  });

  app.get('/api/ruc/:ruc/dv', (req, res) => {
    const ruc = req.params.ruc.replace(/\D/g, '');
    if (!ruc || ruc.length > 8) return res.status(422).json({ error: 'RUC inválido' });
    res.json({ ruc, dv: calcularDV(ruc) });
  });

  app.post('/api/registro', limitarLogin, (req, res) => {
    const { usuario = {}, empresa = {}, plan: idPlan } = req.body;
    const email = texto(usuario.email, 120).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw mal('Email inválido');
    if (texto(usuario.password, 200).length < 8) throw mal('La contraseña debe tener al menos 8 caracteres');
    if (!texto(usuario.nombre)) throw mal('Ingrese su nombre');
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email)) throw mal('Ya existe una cuenta con ese email', 409);
    const e = validarEmpresa(empresa);
    const id = transaccion(db, () => {
      const r = db.prepare(
        `INSERT INTO empresas (ruc, dv, razon_social, nombre_fantasia, tipo_contribuyente, direccion, num_casa,
           dep_cod, dep_desc, ciu_cod, ciu_desc, telefono, email, act_eco_cod, act_eco_desc, timbrado,
           timbrado_inicio, establecimiento, punto_exp, plan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        e.ruc, e.dv, e.razon_social, e.nombre_fantasia, e.tipo_contribuyente, e.direccion, e.num_casa,
        e.dep_cod, e.dep_desc, e.ciu_cod, e.ciu_desc, e.telefono, e.email, e.act_eco_cod, e.act_eco_desc,
        e.timbrado, e.timbrado_inicio, e.establecimiento, e.punto_exp, PLANES[idPlan] ? idPlan : 'estandar',
      );
      const u = db.prepare('INSERT INTO usuarios (empresa_id, email, nombre, hash) VALUES (?, ?, ?, ?)').run(
        r.lastInsertRowid, email, texto(usuario.nombre), hashPassword(usuario.password),
      );
      return Number(u.lastInsertRowid);
    });
    abrirSesion(res, id);
    res.status(201).json({ ok: true });
  });

  app.post('/api/login', limitarLogin, (req, res) => {
    const email = texto(req.body.email, 120).toLowerCase();
    const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!u || !verificarPassword(String(req.body.password || ''), u.hash)) throw mal('Email o contraseña incorrectos', 401);
    abrirSesion(res, u.id);
    res.json({ ok: true });
  });

  // ---------- Con sesión ----------
  app.use('/api', auth);

  app.post('/api/logout', (req, res) => {
    db.prepare('DELETE FROM sesiones WHERE token = ?').run(req.token);
    res.set('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    res.json({ ok: true });
  });

  app.get('/api/sesion', (req, res) => {
    res.json({ usuario: req.usuario, empresa: empresaPublica(req.empresa) });
  });

  app.put('/api/empresa', (req, res) => {
    const e = validarEmpresa(req.body);
    const ambiente = ['simulado', 'test', 'prod'].includes(req.body.ambiente) ? req.body.ambiente : req.empresa.ambiente;
    db.prepare(
      `UPDATE empresas SET ruc=?, dv=?, razon_social=?, nombre_fantasia=?, tipo_contribuyente=?, direccion=?, num_casa=?,
         dep_cod=?, dep_desc=?, ciu_cod=?, ciu_desc=?, telefono=?, email=?, act_eco_cod=?, act_eco_desc=?, timbrado=?,
         timbrado_inicio=?, establecimiento=?, punto_exp=?, ambiente=?, id_csc=? WHERE id=?`,
    ).run(
      e.ruc, e.dv, e.razon_social, e.nombre_fantasia, e.tipo_contribuyente, e.direccion, e.num_casa, e.dep_cod,
      e.dep_desc, e.ciu_cod, e.ciu_desc, e.telefono, e.email, e.act_eco_cod, e.act_eco_desc, e.timbrado,
      e.timbrado_inicio, e.establecimiento, e.punto_exp, ambiente, texto(req.body.idCSC, 4).padStart(4, '0') || '0001',
      req.empresa.id,
    );
    if (req.body.csc) db.prepare('UPDATE empresas SET csc = ? WHERE id = ?').run(cifrar(texto(req.body.csc, 64)), req.empresa.id);
    res.json(empresaPublica(db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.empresa.id)));
  });

  app.put('/api/empresa/certificado', (req, res) => {
    const { archivo, password } = req.body;
    if (!archivo) throw mal('Seleccione el archivo .p12');
    const buf = Buffer.from(String(archivo), 'base64');
    let info;
    try {
      info = leerP12(buf, String(password || ''));
    } catch {
      throw mal('No se pudo abrir el certificado: verifique el archivo y la contraseña');
    }
    if (new Date(info.validoHasta) < new Date()) throw mal('El certificado está vencido');
    db.prepare('UPDATE empresas SET cert_p12 = ?, cert_pass = ?, cert_info = ? WHERE id = ?').run(
      buf, cifrar(password), JSON.stringify({ titular: info.titular, serie: info.serie, validoHasta: info.validoHasta, prueba: false }),
      req.empresa.id,
    );
    res.json({ titular: info.titular, validoHasta: info.validoHasta });
  });

  app.put('/api/empresa/plan', (req, res) => {
    if (!PLANES[req.body.plan]) throw mal('Plan inexistente');
    db.prepare('UPDATE empresas SET plan = ? WHERE id = ?').run(req.body.plan, req.empresa.id);
    res.json({ plan: req.body.plan });
  });

  app.get('/api/panel', (req, res) => {
    const id = req.empresa.id;
    const p = plan(req.empresa.plan);
    const porMoneda = db.prepare(
      `SELECT moneda, COUNT(*) AS cantidad, SUM(total) AS total, SUM(total_gs) AS total_gs FROM documentos
       WHERE empresa_id = ? AND estado = 'aprobado' AND tipo IN (1, 4) AND strftime('%Y-%m', creado) = strftime('%Y-%m', 'now')
       GROUP BY moneda ORDER BY total_gs DESC`,
    ).all(id);
    const porDia = db.prepare(
      `SELECT substr(fecha, 1, 10) AS dia, SUM(total_gs) AS total_gs, COUNT(*) AS cantidad FROM documentos
       WHERE empresa_id = ? AND estado = 'aprobado' AND tipo IN (1, 4) AND creado >= datetime('now', '-30 days')
       GROUP BY dia ORDER BY dia`,
    ).all(id);
    const estados = Object.fromEntries(
      db.prepare(`SELECT estado, COUNT(*) AS n FROM documentos WHERE empresa_id = ? AND strftime('%Y-%m', creado) = strftime('%Y-%m', 'now') GROUP BY estado`)
        .all(id).map((r) => [r.estado, r.n]),
    );
    const recientes = db.prepare('SELECT * FROM documentos WHERE empresa_id = ? ORDER BY id DESC LIMIT 6').all(id).map(docResumen);
    res.json({
      plan: { id: req.empresa.plan, ...p },
      usados: documentosDelMes(db, id),
      productos: db.prepare('SELECT COUNT(*) AS n FROM productos WHERE empresa_id = ?').get(id).n,
      clientes: db.prepare('SELECT COUNT(*) AS n FROM clientes WHERE empresa_id = ?').get(id).n,
      porMoneda, porDia, estados, recientes,
    });
  });

  // ----- Clientes -----
  app.get('/api/clientes', (req, res) => {
    const q = `%${texto(req.query.q, 60)}%`;
    res.json(db.prepare(
      `SELECT * FROM clientes WHERE empresa_id = ? AND (nombre LIKE ? OR ruc LIKE ? OR num_doc LIKE ?) ORDER BY nombre LIMIT 200`,
    ).all(req.empresa.id, q, q, q));
  });
  app.post('/api/clientes', (req, res) => {
    const c = validarCliente(req.body);
    const r = db.prepare(
      `INSERT INTO clientes (empresa_id, contribuyente, ruc, dv, tipo_contribuyente, tipo_doc, num_doc, nombre, direccion,
         email, telefono, pais, pais_desc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(req.empresa.id, c.contribuyente, c.ruc, c.dv, c.tipo_contribuyente, c.tipo_doc, c.num_doc, c.nombre,
      c.direccion, c.email, c.telefono, c.pais, c.pais_desc);
    res.status(201).json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(r.lastInsertRowid));
  });
  app.put('/api/clientes/:id', (req, res) => {
    const c = validarCliente(req.body);
    const r = db.prepare(
      `UPDATE clientes SET contribuyente=?, ruc=?, dv=?, tipo_contribuyente=?, tipo_doc=?, num_doc=?, nombre=?, direccion=?,
         email=?, telefono=?, pais=?, pais_desc=? WHERE id = ? AND empresa_id = ?`,
    ).run(c.contribuyente, c.ruc, c.dv, c.tipo_contribuyente, c.tipo_doc, c.num_doc, c.nombre, c.direccion, c.email,
      c.telefono, c.pais, c.pais_desc, req.params.id, req.empresa.id);
    if (!r.changes) throw mal('Cliente inexistente', 404);
    res.json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id));
  });
  app.delete('/api/clientes/:id', (req, res) => {
    db.prepare('DELETE FROM clientes WHERE id = ? AND empresa_id = ?').run(req.params.id, req.empresa.id);
    res.json({ ok: true });
  });

  // ----- Productos -----
  app.get('/api/productos', (req, res) => {
    const q = `%${texto(req.query.q, 60)}%`;
    res.json(db.prepare(
      'SELECT * FROM productos WHERE empresa_id = ? AND (codigo LIKE ? OR descripcion LIKE ?) ORDER BY descripcion LIMIT 500',
    ).all(req.empresa.id, q, q));
  });
  app.post('/api/productos', (req, res) => {
    const p = validarProducto(req.body);
    const limite = plan(req.empresa.plan).productos;
    if (db.prepare('SELECT COUNT(*) AS n FROM productos WHERE empresa_id = ?').get(req.empresa.id).n >= limite) {
      throw mal(`Su plan permite hasta ${limite} productos`, 403);
    }
    try {
      const r = db.prepare('INSERT INTO productos (empresa_id, codigo, descripcion, precio, moneda, iva) VALUES (?, ?, ?, ?, ?, ?)')
        .run(req.empresa.id, p.codigo, p.descripcion, p.precio, p.moneda, p.iva);
      res.status(201).json(db.prepare('SELECT * FROM productos WHERE id = ?').get(r.lastInsertRowid));
    } catch (e) {
      if (/UNIQUE/.test(e.message)) throw mal('Ya existe un producto con ese código', 409);
      throw e;
    }
  });
  app.put('/api/productos/:id', (req, res) => {
    const p = validarProducto(req.body);
    const r = db.prepare('UPDATE productos SET codigo=?, descripcion=?, precio=?, moneda=?, iva=? WHERE id=? AND empresa_id=?')
      .run(p.codigo, p.descripcion, p.precio, p.moneda, p.iva, req.params.id, req.empresa.id);
    if (!r.changes) throw mal('Producto inexistente', 404);
    res.json(db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id));
  });
  app.delete('/api/productos/:id', (req, res) => {
    db.prepare('DELETE FROM productos WHERE id = ? AND empresa_id = ?').run(req.params.id, req.empresa.id);
    res.json({ ok: true });
  });

  // ----- Cotizaciones -----
  app.get('/api/cotizaciones', async (req, res) => {
    res.json(await cotizaciones(db, req.empresa.id));
  });
  app.put('/api/cotizaciones/:moneda', (req, res) => {
    guardarCotizacion(db, req.empresa.id, req.params.moneda, req.body.valor);
    res.json({ ok: true });
  });
  app.delete('/api/cotizaciones/:moneda', (req, res) => {
    borrarCotizacion(db, req.empresa.id, req.params.moneda);
    res.json({ ok: true });
  });

  // ----- Documentos -----
  app.post('/api/calcular', (req, res) => {
    try {
      res.json(calcularDocumento(req.body));
    } catch (e) {
      throw mal(e.message);
    }
  });

  app.get('/api/documentos', (req, res) => {
    const filtros = ['empresa_id = ?'];
    const args = [req.empresa.id];
    if (req.query.tipo) { filtros.push('tipo = ?'); args.push(Number(req.query.tipo)); }
    if (req.query.estado) { filtros.push('estado = ?'); args.push(texto(req.query.estado, 20)); }
    if (req.query.moneda) { filtros.push('moneda = ?'); args.push(texto(req.query.moneda, 3)); }
    if (req.query.q) {
      filtros.push('(cliente_nombre LIKE ? OR numero LIKE ? OR cdc LIKE ?)');
      const q = `%${texto(req.query.q, 60)}%`;
      args.push(q, q, q);
    }
    if (req.query.aprobados) { filtros.push("estado = 'aprobado' AND tipo IN (1, 4)"); }
    res.json(db.prepare(`SELECT * FROM documentos WHERE ${filtros.join(' AND ')} ORDER BY id DESC LIMIT 300`).all(...args).map(docResumen));
  });

  app.post('/api/documentos', async (req, res) => {
    const b = req.body;
    if ((Number(b.tipo) === 5 || Number(b.tipo) === 6) && !cdcValido(String(b.asociado?.cdc || ''))) {
      throw mal('El CDC del documento asociado no es válido (44 dígitos)');
    }
    const doc = await emitir(db, req.empresa, b);
    res.status(201).json(docResumen(doc));
  });

  function docDe(req) {
    const d = db.prepare('SELECT * FROM documentos WHERE id = ? AND empresa_id = ?').get(req.params.id, req.empresa.id);
    if (!d) throw mal('Documento inexistente', 404);
    return d;
  }

  app.get('/api/documentos/:id', (req, res) => {
    const d = docDe(req);
    res.json({ ...docResumen(d), datos: JSON.parse(d.datos), qr: d.qr });
  });
  app.get('/api/documentos/:id/xml', (req, res) => {
    const d = docDe(req);
    res.set('Content-Disposition', `attachment; filename="${d.cdc}.xml"`).type('application/xml').send(d.xml);
  });
  app.get('/api/documentos/:id/kude', async (req, res) => {
    res.type('html').send(await kudeHtml(req.empresa, docDe(req)));
  });
  app.post('/api/documentos/:id/cancelar', async (req, res) => {
    res.json(docResumen(await cancelar(db, req.empresa, docDe(req), texto(req.body.motivo, 500))));
  });
  app.post('/api/documentos/:id/reenviar', async (req, res) => {
    res.json(docResumen(await reenviar(db, req.empresa, docDe(req))));
  });
  app.get('/api/documentos/:id/consulta', async (req, res) => {
    res.json(await consultar(db, req.empresa, docDe(req)));
  });
  app.post('/api/documentos/:id/email', async (req, res) => {
    const d = docDe(req);
    const para = texto(req.body.email, 120);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(para)) throw mal('Email inválido');
    await enviarPorEmail(req.empresa, d, para);
    res.json({ ok: true });
  });

  // ----- Soporte -----
  app.get('/api/tickets', (req, res) => {
    res.json(db.prepare('SELECT * FROM tickets WHERE empresa_id = ? ORDER BY id DESC').all(req.empresa.id)
      .map((t) => ({ ...t, mensajes: JSON.parse(t.mensajes) })));
  });
  app.post('/api/tickets', (req, res) => {
    const asunto = texto(req.body.asunto, 120);
    const mensaje = texto(req.body.mensaje, 4000);
    if (!asunto || !mensaje) throw mal('Complete asunto y mensaje');
    const msgs = [{ autor: req.usuario.nombre, texto: mensaje, fecha: new Date().toISOString() }];
    const r = db.prepare('INSERT INTO tickets (empresa_id, asunto, mensajes) VALUES (?, ?, ?)').run(req.empresa.id, asunto, JSON.stringify(msgs));
    res.status(201).json({ id: Number(r.lastInsertRowid) });
  });
  app.post('/api/tickets/:id/mensajes', (req, res) => {
    const t = db.prepare('SELECT * FROM tickets WHERE id = ? AND empresa_id = ?').get(req.params.id, req.empresa.id);
    if (!t) throw mal('Ticket inexistente', 404);
    const mensaje = texto(req.body.mensaje, 4000);
    if (!mensaje) throw mal('Escriba un mensaje');
    const msgs = [...JSON.parse(t.mensajes), { autor: req.usuario.nombre, texto: mensaje, fecha: new Date().toISOString() }];
    const estado = req.body.cerrar ? 'cerrado' : 'abierto';
    db.prepare('UPDATE tickets SET mensajes = ?, estado = ? WHERE id = ?').run(JSON.stringify(msgs), estado, t.id);
    res.json({ ok: true });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta inexistente' }));

  // ---------- Frontend ----------
  app.use(express.static(join(RAIZ, '..', 'public'), { extensions: ['html'] }));
  app.get('/{*ruta}', (req, res) => res.sendFile(join(RAIZ, '..', 'public', 'index.html')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 && !err.status ? 'Error interno' : err.message });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.PORT) || 3000;
  crearApp().listen(puerto, () => console.log(`FactElect_PG escuchando en http://localhost:${puerto}`));
}

