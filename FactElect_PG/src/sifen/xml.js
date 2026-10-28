import {
  VERSION, TIPOS_DE, MONEDAS, TIPOS_TRANSACCION, AFECTACION_IVA, TIPOS_ID, CONDICION_OPERACION,
  TIPOS_PAGO, MOTIVOS_NC_ND, MOTIVOS_REMISION, RESPONSABLES_REMISION, UNIDAD_DEFECTO,
} from './constants.js';
import { generarCDC } from './cdc.js';
import { calcularDV } from './dv.js';
import { fmtXml } from './calc.js';

const NS = 'http://ekuatia.set.gov.py/sifen/xsd';

export function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Nodo XML: hijos como array (se omiten null/undefined/false) o valor escalar.
function el(nombre, contenido, attrs = {}) {
  if (contenido === null || contenido === undefined || contenido === false) return '';
  const a = Object.entries(attrs).map(([k, v]) => ` ${k}="${escapar(v)}"`).join('');
  const cuerpo = Array.isArray(contenido) ? contenido.filter(Boolean).join('') : escapar(contenido);
  return `<${nombre}${a}>${cuerpo}</${nombre}>`;
}

const pad = (v, n) => String(v).padStart(n, '0');

function gOpeCom(tipo, doc, t) {
  if (tipo === 7) return '';
  const moneda = doc.moneda || 'PYG';
  return el('gOpeCom', [
    tipo === 1 || tipo === 4 ? el('iTipTra', doc.tipoTransaccion || 1) : '',
    tipo === 1 || tipo === 4 ? el('dDesTipTra', TIPOS_TRANSACCION[doc.tipoTransaccion || 1]) : '',
    el('iTImp', 1),
    el('dDesTImp', 'IVA'),
    el('cMoneOpe', moneda),
    el('dDesMoneOpe', MONEDAS[moneda]?.nombre || moneda),
    moneda !== 'PYG' ? el('dCondTiCam', t.condicionTipoCambio) : '',
    moneda !== 'PYG' && t.condicionTipoCambio === 1 ? el('dTiCam', fmtXml(t.tipoCambio, 4)) : '',
  ]);
}

function gEmis(e) {
  return el('gEmis', [
    el('dRucEm', e.ruc),
    el('dDVEmi', e.dv),
    el('iTipCont', e.tipoContribuyente),
    el('dNomEmi', e.razonSocial),
    e.nombreFantasia ? el('dNomFanEmi', e.nombreFantasia) : '',
    el('dDirEmi', e.direccion),
    el('dNumCas', e.numCasa || '0'),
    el('cDepEmi', e.depCod),
    el('dDesDepEmi', e.depDesc),
    el('cCiuEmi', e.ciuCod),
    el('dDesCiuEmi', e.ciuDesc),
    el('dTelEmi', e.telefono),
    el('dEmailE', e.email),
    el('gActEco', [el('cActEco', e.actEcoCod), el('dDesActEco', e.actEcoDesc)]),
  ]);
}

function gDatRec(c) {
  const pais = c.pais || 'PRY';
  const conDireccion = c.direccion && c.depCod && c.ciuCod;
  const comunes = [
    el('dNomRec', c.nombre),
    conDireccion ? el('dDirRec', c.direccion) : '',
    conDireccion ? el('dNumCasRec', c.numCasa || '0') : '',
    conDireccion ? el('cDepRec', c.depCod) : '',
    conDireccion ? el('dDesDepRec', c.depDesc) : '',
    conDireccion ? el('cCiuRec', c.ciuCod) : '',
    conDireccion ? el('dDesCiuRec', c.ciuDesc) : '',
    c.telefono ? el('dTelRec', c.telefono) : '',
    c.email ? el('dEmailRec', c.email) : '',
  ];
  if (c.contribuyente) {
    return el('gDatRec', [
      el('iNatRec', 1),
      el('iTiOpe', c.tipoOperacion || 1),
      el('cPaisRec', pais),
      el('dDesPaisRe', c.paisDesc || 'Paraguay'),
      el('iTiContRec', c.tipoContribuyente || 1),
      el('dRucRec', c.ruc),
      el('dDVRec', c.dv),
      ...comunes,
    ]);
  }
  const tipoId = Number(c.tipoDoc || 1);
  return el('gDatRec', [
    el('iNatRec', 2),
    el('iTiOpe', c.tipoOperacion || (pais === 'PRY' ? 2 : 4)),
    el('cPaisRec', pais),
    el('dDesPaisRe', c.paisDesc || 'Paraguay'),
    el('iTipIDRec', tipoId),
    el('dDTipIDRec', TIPOS_ID[tipoId]),
    el('dNumIDRec', tipoId === 5 ? '0' : c.numDoc),
    ...(tipoId === 5 ? [el('dNomRec', 'Sin Nombre')] : comunes),
  ]);
}

function gCamCond(doc, moneda, total) {
  const cond = doc.condicion || { tipo: 1 };
  const tipo = Number(cond.tipo || 1);
  const pago = Number(cond.pagoTipo || 1);
  return el('gCamCond', [
    el('iCondOpe', tipo),
    el('dDCondOpe', CONDICION_OPERACION[tipo]),
    tipo === 1
      ? el('gPaConEIni', [
          el('iTiPago', pago),
          el('dDesTiPag', TIPOS_PAGO[pago]),
          el('dMonTiPag', fmtXml(total, MONEDAS[moneda]?.decimales ?? 2)),
          el('cMoneTiPag', moneda),
          el('dDMoneTiPag', MONEDAS[moneda]?.nombre || moneda),
          moneda !== 'PYG' && doc.tipoCambio ? el('dTiCamTiPag', fmtXml(doc.tipoCambio, 4)) : '',
        ])
      : el('gPagCred', [el('iCondCred', 1), el('dDCondCred', 'Plazo'), el('dPlazoCre', cond.plazo || '30 días')]),
  ]);
}

function gCamItem(tipo, it) {
  const unidad = it.unidad || UNIDAD_DEFECTO;
  return el('gCamItem', [
    el('dCodInt', it.codigo || '1'),
    el('dDesProSer', it.descripcion),
    el('cUniMed', unidad.codigo),
    el('dDesUniMed', unidad.descripcion),
    el('dCantProSer', fmtXml(it.cantidad, 4)),
    it.observacion ? el('dInfItem', it.observacion) : '',
    tipo !== 7 &&
      el('gValorItem', [
        el('dPUniProSer', fmtXml(it.precioUnitario)),
        it.totalOperacionGs !== undefined ? el('dTiCamIt', fmtXml(it.tipoCambio, 4)) : '',
        el('dTotBruOpeItem', fmtXml(it.totalBruto)),
        el('gValorRestaItem', [
          el('dDescItem', fmtXml(it.descuento)),
          it.descuento > 0 ? el('dPorcDesIt', fmtXml(it.porcentajeDescuento, 2)) : '',
          el('dDescGloItem', '0'),
          el('dAntPreUniIt', '0'),
          el('dAntGloPreUniIt', '0'),
          el('dTotOpeItem', fmtXml(it.totalOperacion)),
          it.totalOperacionGs !== undefined ? el('dTotOpeGs', fmtXml(it.totalOperacionGs, 0)) : '',
        ]),
      ]),
    tipo !== 7 &&
      tipo !== 4 &&
      el('gCamIVA', [
        el('iAfecIVA', it.ivaTipo),
        el('dDesAfecIVA', AFECTACION_IVA[it.ivaTipo]),
        el('dPropIVA', it.ivaProporcion),
        el('dTasaIVA', it.iva),
        el('dBasGravIVA', fmtXml(it.baseGravada)),
        el('dLiqIVAItem', fmtXml(it.liquidacionIva)),
        el('dBasExe', fmtXml(it.baseExenta)),
      ]),
  ]);
}

function gTransp(r, e) {
  const lugar = (pref, l) => [
    el(`dDirLoc${pref}`, l.direccion),
    el(`dNumCas${pref}`, l.numCasa || '0'),
    el(`cDep${pref}`, l.depCod || e.depCod),
    el(`dDesDep${pref}`, l.depDesc || e.depDesc),
    el(`cCiu${pref}`, l.ciuCod || e.ciuCod),
    el(`dDesCiu${pref}`, l.ciuDesc || e.ciuDesc),
  ];
  const tr = r.transportista || {};
  return el('gTransp', [
    el('iModTrans', 1),
    el('dDesModTrans', 'Terrestre'),
    el('iRespFlete', r.respFlete || 1),
    el('dIniTras', r.fechaInicio),
    el('dFinTras', r.fechaFin || r.fechaInicio),
    el('gCamSal', lugar('Sal', r.salida || {})),
    el('gCamEnt', lugar('Ent', r.entrega || {})),
    el('gVehTras', [
      el('dTiVehTras', r.vehiculo?.tipo || 'Camión'),
      el('dMarVeh', r.vehiculo?.marca || 'S/D'),
      el('dTipIdenVeh', 2),
      el('dNroMatVeh', r.vehiculo?.matricula),
    ]),
    tr.nombre &&
      el('gCamTrans', [
        el('iNatTrans', tr.ruc ? 1 : 2),
        el('dNomTrans', tr.nombre),
        tr.ruc ? el('dRucTrans', tr.ruc) : '',
        tr.ruc ? el('dDVTrans', tr.dv ?? calcularDV(tr.ruc)) : '',
        !tr.ruc ? el('iTipIDTrans', 1) : '',
        !tr.ruc ? el('dDTipIDTrans', TIPOS_ID[1]) : '',
        !tr.ruc ? el('dNumIDTrans', tr.documento) : '',
        el('dNumIDChof', tr.choferDoc),
        el('dNomChof', tr.choferNombre),
      ]),
  ]);
}

function gTotSub(tipo, t) {
  const d = t.decimales;
  const f = (v) => fmtXml(v, d);
  return el('gTotSub', [
    tipo !== 4 && el('dSubExe', f(t.subExento)),
    tipo !== 4 && el('dSubExo', f(t.subExonerado)),
    tipo !== 4 && el('dSub5', f(t.sub5)),
    tipo !== 4 && el('dSub10', f(t.sub10)),
    el('dTotOpe', f(t.totalOperacion)),
    el('dTotDesc', f(t.totalDescuento)),
    el('dTotDescGlotem', '0'),
    el('dTotAntItem', '0'),
    el('dTotAnt', '0'),
    el('dPorcDescTotal', '0'),
    el('dDescTotal', f(t.totalDescuento)),
    el('dAnticipo', '0'),
    el('dRedon', f(t.redondeo)),
    el('dTotGralOpe', f(t.totalGeneral)),
    tipo !== 4 && el('dIVA5', f(t.iva5)),
    tipo !== 4 && el('dIVA10', f(t.iva10)),
    tipo !== 4 && el('dLiqTotIVA5', '0'),
    tipo !== 4 && el('dLiqTotIVA10', '0'),
    tipo !== 4 && el('dTotIVA', f(t.totalIva)),
    tipo !== 4 && el('dBaseGrav5', f(t.baseGravada5)),
    tipo !== 4 && el('dBaseGrav10', f(t.baseGravada10)),
    tipo !== 4 && el('dTBasGraIVA', f(t.totalBaseGravada)),
    t.totalGs !== undefined ? el('dTotalGs', fmtXml(t.totalGs, 0)) : '',
  ]);
}

function gCamDEAsoc(tipo, doc) {
  if (tipo === 5 || tipo === 6) {
    return el('gCamDEAsoc', [el('iTipDocAso', 1), el('dDesTipDocAso', 'Electrónico'), el('dCdCDERef', doc.asociado.cdc)]);
  }
  if (tipo === 4) {
    const c = doc.autofactura?.constancia || {};
    return el('gCamDEAsoc', [
      el('iTipDocAso', 3),
      el('dDesTipDocAso', 'Constancia Electrónica'),
      el('iTipCons', 1),
      el('dDesTipCons', 'Constancia de no ser contribuyente'),
      c.numero ? el('dNumCons', c.numero) : '',
      c.control ? el('dNumControl', c.control) : '',
    ]);
  }
  return '';
}

// Arma el rDE sin firma. Devuelve { xml, cdc }.
// empresa: datos del emisor y timbrado; doc: datos del comprobante; calc: salida de calcularDocumento.
export function construirDE(empresa, doc, calc) {
  const tipo = Number(doc.tipo);
  if (!TIPOS_DE[tipo]) throw new Error(`Tipo de documento no soportado: ${doc.tipo}`);
  if ((tipo === 5 || tipo === 6) && !doc.asociado?.cdc) throw new Error('Falta el CDC del documento asociado');
  if (tipo === 7 && !doc.remision?.vehiculo?.matricula) throw new Error('Falta la matrícula del vehículo');

  const t = calc.totales;
  const cdc = generarCDC({
    tipo,
    ruc: empresa.ruc,
    dvRuc: empresa.dv,
    establecimiento: empresa.establecimiento,
    puntoExp: empresa.puntoExp,
    numero: doc.numero,
    tipoContribuyente: empresa.tipoContribuyente,
    fecha: doc.fecha,
    codigoSeguridad: doc.codigoSeguridad,
  });

  // En la autofactura el receptor es el propio emisor.
  const receptor =
    tipo === 4
      ? { contribuyente: true, tipoOperacion: 1, ruc: empresa.ruc, dv: empresa.dv, tipoContribuyente: empresa.tipoContribuyente, nombre: empresa.razonSocial }
      : doc.cliente;

  const v = doc.autofactura?.vendedor || {};
  const tipoIdVen = Number(v.tipoDoc || 1);
  const r = doc.remision || {};

  const de = el(
    'DE',
    [
      el('dDVId', cdc.slice(-1)),
      el('dFecFirma', doc.fechaFirma || doc.fecha),
      el('dSisFact', 1),
      el('gOpeDE', [el('iTipEmi', 1), el('dDesTipEmi', 'Normal'), el('dCodSeg', doc.codigoSeguridad), doc.observacion ? el('dInfoEmi', doc.observacion) : '']),
      el('gTimb', [
        el('iTiDE', tipo),
        el('dDesTiDE', TIPOS_DE[tipo].nombre),
        el('dNumTim', empresa.timbrado),
        el('dEst', pad(empresa.establecimiento, 3)),
        el('dPunExp', pad(empresa.puntoExp, 3)),
        el('dNumDoc', pad(doc.numero, 7)),
        el('dFeIniT', empresa.timbradoInicio),
      ]),
      el('gDatGralOpe', [el('dFeEmiDE', doc.fecha), gOpeCom(tipo, doc, t), gEmis(empresa), gDatRec(receptor)]),
      el('gDtipDE', [
        tipo === 1 && el('gCamFE', [el('iIndPres', 1), el('dDesIndPres', 'Operación presencial')]),
        tipo === 4 &&
          el('gCamAE', [
            el('iNatVen', 1),
            el('dDesNatVen', 'No contribuyente'),
            el('iTipIDVen', tipoIdVen),
            el('dDTipIDVen', TIPOS_ID[tipoIdVen]),
            el('dNumIDVen', v.numDoc),
            el('dNomVen', v.nombre),
            el('dDirVen', v.direccion),
            el('dNumCasVen', v.numCasa || '0'),
            el('cDepVen', empresa.depCod),
            el('dDesDepVen', empresa.depDesc),
            el('cCiuVen', empresa.ciuCod),
            el('dDesCiuVen', empresa.ciuDesc),
            el('dDirProv', v.direccion),
            el('cDepProv', empresa.depCod),
            el('dDesDepProv', empresa.depDesc),
            el('cCiuProv', empresa.ciuCod),
            el('dDesCiuProv', empresa.ciuDesc),
          ]),
        (tipo === 5 || tipo === 6) &&
          el('gCamNCDE', [el('iMotEmi', doc.motivo || 1), el('dDesMotEmi', MOTIVOS_NC_ND[doc.motivo || 1])]),
        tipo === 7 &&
          el('gCamNRE', [
            el('iMotEmiNR', r.motivo || 1),
            el('dDesMotEmiNR', MOTIVOS_REMISION[r.motivo || 1]),
            el('iRespEmiNR', r.responsable || 1),
            el('dDesRespEmiNR', RESPONSABLES_REMISION[r.responsable || 1]),
          ]),
        (tipo === 1 || tipo === 4) && gCamCond(doc, t.moneda, t.totalGeneral),
        ...calc.items.map((it) => gCamItem(tipo, it)),
        tipo === 7 && gTransp(r, empresa),
      ]),
      tipo !== 7 && gTotSub(tipo, t),
      gCamDEAsoc(tipo, doc),
    ],
    { Id: cdc },
  );

  const xml =
    `<rDE xmlns="${NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xsi:schemaLocation="${NS} siRecepDE_v${VERSION}.xsd">` +
    el('dVerFor', VERSION) +
    de +
    '</rDE>';
  return { xml, cdc };
}
