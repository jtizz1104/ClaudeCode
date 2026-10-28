import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'factelect-'));
process.env.SECRET_PATH = join(dir, 'secret.key');
process.env.RATES_URL = 'http://127.0.0.1:9/no-disponible';

const { abrirDB } = await import('../src/db.js');
const { crearApp } = await import('../src/server.js');

let servidor;
let base;
let cookie = '';

async function api(metodo, ruta, cuerpo) {
  const res = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', cookie },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const sc = res.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  const tipo = res.headers.get('content-type') || '';
  return { status: res.status, body: tipo.includes('json') ? await res.json() : await res.text() };
}

before(async () => {
  servidor = crearApp(abrirDB(join(dir, 'test.db'))).listen(0);
  await new Promise((r) => servidor.once('listening', r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => {
  servidor.close();
  rmSync(dir, { recursive: true, force: true });
});

const empresa = {
  ruc: '80012345', razonSocial: 'Comercial Ejemplo SA', tipoContribuyente: 2, direccion: 'Mcal. López 1000',
  telefono: '021555000', email: 'admin@ejemplo.com.py', actEcoCod: '47190',
  actEcoDesc: 'Comercio al por menor', timbrado: '16000001', timbradoInicio: '2026-01-01',
};

test('flujo completo: registro, emisión multidivisa, NC, cancelación y plan', async () => {
  let r = await api('GET', '/api/panel');
  assert.equal(r.status, 401);

  r = await api('POST', '/api/registro', { usuario: { nombre: 'Ana', email: 'ana@ejemplo.com', password: 'corta' }, empresa });
  assert.equal(r.status, 422);

  r = await api('POST', '/api/registro', { usuario: { nombre: 'Ana', email: 'ana@ejemplo.com', password: 'segura123' }, empresa: { ...empresa, dv: 9 }, plan: 'simple' });
  assert.equal(r.status, 422, 'DV incorrecto');

  r = await api('POST', '/api/registro', { usuario: { nombre: 'Ana', email: 'ana@ejemplo.com', password: 'segura123' }, empresa, plan: 'simple' });
  assert.equal(r.status, 201);

  r = await api('GET', '/api/sesion');
  assert.equal(r.body.empresa.dv, 0);
  assert.equal(r.body.empresa.ambiente, 'simulado');

  r = await api('POST', '/api/clientes', { contribuyente: true, ruc: '44444401-7', nombre: 'Cliente Contribuyente SA', email: 'c@c.com' });
  assert.equal(r.status, 201);
  const clienteId = r.body.id;

  r = await api('POST', '/api/productos', { codigo: 'P1', descripcion: 'Licencia anual', precio: 120, moneda: 'USD', iva: 10 });
  assert.equal(r.status, 201);

  r = await api('GET', '/api/cotizaciones');
  assert.ok(r.body.error, 'sin red informa el error y no falla');
  r = await api('PUT', '/api/cotizaciones/USD', { valor: 7310.25 });
  r = await api('GET', '/api/cotizaciones');
  assert.equal(r.body.monedas.USD.valor, 7310.25);

  // Factura en USD
  r = await api('POST', '/api/documentos', {
    tipo: 1, moneda: 'USD', tipoCambio: 7310.25, cliente: { id: clienteId },
    condicion: { tipo: 2, plazo: '30 días' },
    items: [{ codigo: 'P1', descripcion: 'Licencia anual', cantidad: 2, precioUnitario: 120, iva: 10 }],
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.estado, 'aprobado');
  assert.equal(r.body.numero, '0000001');
  assert.equal(r.body.total, 240);
  assert.equal(r.body.totalGs, Math.round(240 * 7310.25));
  const factura = r.body;

  r = await api('GET', `/api/documentos/${factura.id}/xml`);
  assert.match(r.body, /<Signature xmlns="http:\/\/www.w3.org\/2000\/09\/xmldsig#">/);
  assert.match(r.body, /<dCarQR>https:\/\/ekuatia.set.gov.py\/consultas-test\/qr\?nVersion=150/);

  r = await api('GET', `/api/documentos/${factura.id}/kude`);
  assert.match(r.body, /FACTURA ELECTRÓNICA/);
  assert.match(r.body, /Total en guaraníes/);

  // Factura en guaraníes a consumidor final
  r = await api('POST', '/api/documentos', {
    tipo: 1, moneda: 'PYG', cliente: null,
    items: [{ descripcion: 'Venta mostrador', cantidad: 1, precioUnitario: 55000, iva: 10 }],
  });
  assert.equal(r.status, 422, 'exige cliente o innominado explícito');
  r = await api('POST', '/api/documentos', {
    tipo: 1, moneda: 'PYG', cliente: { innominado: true },
    items: [{ descripcion: 'Venta mostrador', cantidad: 1, precioUnitario: 55000, iva: 10 }],
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.numero, '0000002');

  // El plan Simple no incluye nota de débito
  r = await api('POST', '/api/documentos', {
    tipo: 6, moneda: 'PYG', cliente: { id: clienteId }, asociado: { cdc: factura.cdc },
    items: [{ descripcion: 'Intereses', cantidad: 1, precioUnitario: 1000, iva: 10 }],
  });
  assert.equal(r.status, 403);

  // Nota de crédito sobre la factura en USD
  r = await api('POST', '/api/documentos', {
    tipo: 5, moneda: 'USD', tipoCambio: 7310.25, cliente: { id: clienteId }, asociado: { cdc: factura.cdc }, motivo: 3,
    items: [{ descripcion: 'Descuento', cantidad: 1, precioUnitario: 20, iva: 10 }],
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.numero, '0000001', 'numeración propia por tipo de documento');

  // Cancelación
  r = await api('POST', `/api/documentos/${factura.id}/cancelar`, { motivo: 'no' });
  assert.equal(r.status, 422);
  r = await api('POST', `/api/documentos/${factura.id}/cancelar`, { motivo: 'Error en los datos del cliente' });
  assert.equal(r.body.estado, 'cancelado');

  r = await api('GET', '/api/panel');
  assert.equal(r.body.usados, 3);
  assert.ok(r.body.porMoneda.some((m) => m.moneda === 'PYG'));

  r = await api('PUT', '/api/empresa/plan', { plan: 'estandar' });
  r = await api('GET', '/api/sesion');
  assert.equal(r.body.empresa.plan, 'estandar');

  r = await api('GET', '/api/documentos?q=Contribuyente');
  assert.equal(r.body.length, 2);

  r = await api('POST', '/api/logout');
  r = await api('GET', '/api/panel');
  assert.equal(r.status, 401);
});
