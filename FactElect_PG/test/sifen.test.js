import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SignedXml } from 'xml-crypto';
import { calcularDV, rucValido } from '../src/sifen/dv.js';
import { generarCDC, descomponerCDC, cdcValido } from '../src/sifen/cdc.js';
import { calcularDocumento, fmtXml } from '../src/sifen/calc.js';
import { construirDE } from '../src/sifen/xml.js';
import { firmarXml, leerP12, certificadoDePrueba } from '../src/sifen/firma.js';
import { urlQR, insertarQR } from '../src/sifen/qr.js';
import { _interno } from '../src/sifen/soap.js';

test('DV módulo 11 (valores calculados a mano)', () => {
  // 44444401 → 1·2+0·3+4·4+4·5+4·6+4·7+4·8+4·9 = 158; 158 mod 11 = 4; 11-4 = 7
  assert.equal(calcularDV('44444401'), 7);
  // 80012345 → 5·2+4·3+3·4+2·5+1·6+0·7+0·8+8·9 = 122; 122 mod 11 = 1 → DV 0
  assert.equal(calcularDV('80012345'), 0);
  // Las letras se convierten a su código ASCII (RUC de extranjeros): "A1" → "651"
  assert.equal(calcularDV('A1'), calcularDV('651'));
  assert.ok(rucValido('44444401-7'));
  assert.ok(!rucValido('44444401-3'));
});

const CDC_EJEMPLO = generarCDC({
  tipo: 1, ruc: '44444401', dvRuc: 7, establecimiento: '001', puntoExp: '002', numero: 14528,
  tipoContribuyente: 2, fecha: '2026-01-25T10:00:00', codigoSeguridad: '58732260',
});

test('CDC: armado, validación y descomposición', () => {
  assert.equal(CDC_EJEMPLO.length, 44);
  assert.equal(CDC_EJEMPLO.slice(0, 43), '0144444401700100200145282202601251058732260');
  const p = descomponerCDC(CDC_EJEMPLO);
  assert.equal(p.tipo, 1);
  assert.equal(p.ruc, '44444401');
  assert.equal(p.numero, '0014528');
  assert.equal(p.fecha, '2026-01-25');
  assert.equal(p.codigoSeguridad, '058732260');
  assert.ok(cdcValido(CDC_EJEMPLO));
  const dvMal = (Number(CDC_EJEMPLO[43]) + 1) % 10;
  assert.ok(!cdcValido(CDC_EJEMPLO.slice(0, 43) + dvMal));
});

test('cálculo en guaraníes con IVA 10%, 5% y exento', () => {
  const { totales: t, items } = calcularDocumento({
    tipo: 1, moneda: 'PYG',
    items: [
      { cantidad: 2, precioUnitario: 110000, iva: 10, ivaTipo: 1 },
      { cantidad: 1, precioUnitario: 21000, iva: 5, ivaTipo: 1 },
      { cantidad: 3, precioUnitario: 5000, iva: 0, ivaTipo: 3 },
    ],
  });
  assert.equal(items[0].baseGravada, 200000);
  assert.equal(items[0].liquidacionIva, 20000);
  assert.equal(t.sub10, 220000);
  assert.equal(t.sub5, 21000);
  assert.equal(t.subExento, 15000);
  assert.equal(t.totalGeneral, 256000);
  assert.equal(t.iva10, 20000);
  assert.equal(t.iva5, 1000);
  assert.equal(t.totalIva, 21000);
  assert.equal(t.totalGs, undefined);
});

test('cálculo multidivisa: USD con tipo de cambio global', () => {
  const { totales: t } = calcularDocumento({
    tipo: 1, moneda: 'USD', condicionTipoCambio: 1, tipoCambio: 7350.5,
    items: [{ cantidad: 3, precioUnitario: 19.99, iva: 10, ivaTipo: 1, descuento: 1.5 }],
  });
  assert.equal(t.totalGeneral, 55.47);
  assert.equal(t.totalDescuento, 4.5);
  assert.equal(t.iva10, 5.04);
  assert.equal(t.totalGs, Math.round(55.47 * 7350.5));
});

test('cálculo multidivisa: EUR con tipo de cambio por ítem', () => {
  const { totales: t, items } = calcularDocumento({
    tipo: 1, moneda: 'EUR', condicionTipoCambio: 2,
    items: [
      { cantidad: 1, precioUnitario: 100, iva: 10, tipoCambio: 8000 },
      { cantidad: 1, precioUnitario: 50, iva: 10, tipoCambio: 8100 },
    ],
  });
  assert.equal(items[1].totalOperacionGs, 405000);
  assert.equal(t.totalGs, 1205000);
  assert.equal(t.tipoCambio, null);
});

test('cálculo: errores de negocio', () => {
  assert.throws(() => calcularDocumento({ moneda: 'USD', items: [{ cantidad: 1, precioUnitario: 1, iva: 10 }] }), /tipo de cambio/);
  assert.throws(() => calcularDocumento({ moneda: 'PYG', items: [{ cantidad: 0, precioUnitario: 1, iva: 10 }] }), /cantidad/);
  assert.throws(() => calcularDocumento({ moneda: 'PYG', items: [{ cantidad: 1, precioUnitario: 1, iva: 7 }] }), /tasa/);
});

test('fmtXml no usa notación exponencial ni ceros de más', () => {
  assert.equal(fmtXml(0.00000001), '0.00000001');
  assert.equal(fmtXml(1500.5), '1500.5');
  assert.equal(fmtXml(1500, 0), '1500');
});

const empresa = {
  ruc: '44444401', dv: 7, razonSocial: 'DE generado en ambiente de prueba - sin valor comercial ni fiscal',
  tipoContribuyente: 2, direccion: 'Av. España 1234', numCasa: '1234', depCod: 1, depDesc: 'CAPITAL',
  ciuCod: 1, ciuDesc: 'ASUNCION (DISTRITO)', telefono: '0981123456', email: 'facturas@empresa.com.py',
  actEcoCod: '62010', actEcoDesc: 'Actividades de programación informática', timbrado: '12345678',
  timbradoInicio: '2026-01-01', establecimiento: '001', puntoExp: '001',
};

function factura(extra = {}) {
  const calc = calcularDocumento({
    tipo: 1, moneda: 'USD', tipoCambio: 7300,
    items: [{ codigo: 'SRV-1', descripcion: 'Desarrollo <web> & soporte', cantidad: 1, precioUnitario: 1100, iva: 10, ivaTipo: 1 }],
  });
  const doc = {
    tipo: 1, numero: 15, fecha: '2026-10-26T10:30:00', codigoSeguridad: '123456789', moneda: 'USD',
    tipoTransaccion: 2, cliente: { contribuyente: true, ruc: '80012345', dv: calcularDV('80012345'), nombre: 'Cliente SA', tipoOperacion: 1 },
    condicion: { tipo: 1, pagoTipo: 5 }, tipoCambio: 7300, ...extra,
  };
  return { calc, doc, ...construirDE(empresa, doc, calc) };
}

test('XML del DE: estructura, multidivisa y escape', () => {
  const { xml, cdc } = factura();
  assert.ok(cdcValido(cdc));
  assert.match(xml, new RegExp(`<DE Id="${cdc}">`));
  assert.match(xml, /<cMoneOpe>USD<\/cMoneOpe><dDesMoneOpe>US Dollar<\/dDesMoneOpe><dCondTiCam>1<\/dCondTiCam><dTiCam>7300<\/dTiCam>/);
  assert.match(xml, /<dTotGralOpe>1100<\/dTotGralOpe>/);
  assert.match(xml, /<dTotalGs>8030000<\/dTotalGs>/);
  assert.match(xml, /<dIVA10>100<\/dIVA10>/);
  assert.match(xml, /Desarrollo &lt;web&gt; &amp; soporte/);
  assert.match(xml, /<gCamFE>.*<\/gCamFE><gCamCond>/);
  // gTotSub después de gDtipDE
  assert.ok(xml.indexOf('<gTotSub>') > xml.indexOf('</gDtipDE>'));
});

test('XML: nota de crédito exige y referencia el documento asociado', () => {
  const calc = calcularDocumento({ tipo: 5, moneda: 'PYG', items: [{ descripcion: 'Devolución', cantidad: 1, precioUnitario: 11000, iva: 10 }] });
  const base = { tipo: 5, numero: 1, fecha: '2026-10-26T10:30:00', codigoSeguridad: '000000001', moneda: 'PYG', cliente: { contribuyente: false, tipoDoc: 1, numDoc: '1234567', nombre: 'Juan Pérez' }, motivo: 2 };
  assert.throws(() => construirDE(empresa, base, calc), /asociado/);
  const { xml } = construirDE(empresa, { ...base, asociado: { cdc: CDC_EJEMPLO } }, calc);
  assert.match(xml, /<gCamNCDE><iMotEmi>2<\/iMotEmi><dDesMotEmi>Devolución<\/dDesMotEmi><\/gCamNCDE>/);
  assert.match(xml, new RegExp(`<dCdCDERef>${CDC_EJEMPLO}</dCdCDERef>`));
  assert.doesNotMatch(xml, /<gCamCond>/);
});

test('XML: nota de remisión sin valores y con transporte', () => {
  const calc = calcularDocumento({ tipo: 7, moneda: 'PYG', items: [{ descripcion: 'Cajas', cantidad: 10, precioUnitario: 0, iva: 10 }] });
  const { xml } = construirDE(empresa, {
    tipo: 7, numero: 1, fecha: '2026-10-26T10:30:00', codigoSeguridad: '000000002',
    cliente: { contribuyente: true, ruc: '80012345', dv: 4, nombre: 'Cliente SA' },
    remision: { motivo: 7, fechaInicio: '2026-10-27', salida: { direccion: 'Depósito' }, entrega: { direccion: 'Sucursal' }, vehiculo: { matricula: 'ABC123' } },
  }, calc);
  assert.doesNotMatch(xml, /<gOpeCom>|<gTotSub>|<gValorItem>/);
  assert.match(xml, /<gTransp>.*<dNroMatVeh>ABC123<\/dNroMatVeh>/);
});

test('firma XMLDSig verificable y QR con hash correcto', () => {
  const cred = leerP12(certificadoDePrueba('PRUEBA'), 'prueba');
  const { xml, cdc, calc, doc } = factura();
  const firmado = firmarXml(xml, cred);
  assert.match(firmado.xml, new RegExp(`<Reference URI="#${cdc}">`));
  assert.ok(firmado.xml.indexOf('<Signature') > firmado.xml.indexOf('</DE>'));

  const verif = new SignedXml({ publicCert: cred.certificado });
  const nodoFirma = /<Signature[\s\S]*<\/Signature>/.exec(firmado.xml)[0];
  verif.loadSignature(nodoFirma);
  assert.ok(verif.checkSignature(firmado.xml), 'la firma debe verificar');

  const url = urlQR({
    cdc, fechaEmision: doc.fecha, receptor: doc.cliente, totalGeneral: calc.totales.totalGeneral,
    totalIva: calc.totales.totalIva, cantidadItems: 1, digestValue: firmado.digestValue, idCSC: '0001',
    csc: 'ABCD0000000000000000000000000000', ambiente: 'test',
  });
  assert.ok(url.startsWith('https://ekuatia.set.gov.py/consultas-test/qr?nVersion=150&Id=' + cdc));
  const [params, hash] = url.split('?')[1].split('&cHashQR=');
  assert.equal(hash, createHash('sha256').update(params + 'ABCD0000000000000000000000000000').digest('hex'));
  assert.match(params, new RegExp(`dFeEmiDE=${Buffer.from(doc.fecha).toString('hex')}&dRucRec=80012345`));

  const conQR = insertarQR(firmado.xml, url);
  assert.match(conQR, /<\/Signature><gCamFuFD><dCarQR>https:[^<]*&amp;Id=/);
  // Insertar el QR fuera del DE no invalida la firma.
  const v2 = new SignedXml({ publicCert: cred.certificado });
  v2.loadSignature(nodoFirma);
  assert.ok(v2.checkSignature(conQR));
});

test('lectura de respuestas SOAP del SIFEN', () => {
  const r = _interno.leerRespuesta(
    '<env:Envelope><env:Body><ns2:rRetEnviDe><ns2:rProtDe><ns2:dEstRes>Rechazado</ns2:dEstRes>' +
    '<ns2:gResProc><ns2:dCodRes>1001</ns2:dCodRes><ns2:dMsgRes>CDC duplicado</ns2:dMsgRes></ns2:gResProc>' +
    '</ns2:rProtDe></ns2:rRetEnviDe></env:Body></env:Envelope>',
  );
  assert.equal(r.estado, 'Rechazado');
  assert.equal(r.codigo, '1001');
  assert.equal(r.mensaje, 'CDC duplicado');
});
