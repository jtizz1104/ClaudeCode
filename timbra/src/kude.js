import QRCode from 'qrcode';
import { TIPOS_DE, MONEDAS, CONDICION_OPERACION, MOTIVOS_NC_ND, MOTIVOS_REMISION } from './sifen/constants.js';
import { escapar } from './sifen/xml.js';

function monto(valor, moneda) {
  const dec = MONEDAS[moneda]?.decimales ?? 2;
  return new Intl.NumberFormat('es-PY', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(valor || 0);
}

const cdcAgrupado = (cdc) => cdc.match(/.{1,4}/g).join(' ');

// Representación gráfica (KuDE) imprimible del documento electrónico.
export async function kudeHtml(empresa, doc) {
  const d = JSON.parse(doc.datos);
  const t = d.totales;
  const m = doc.moneda;
  const tipo = doc.tipo;
  const conValores = tipo !== 7;
  const qrImg = await QRCode.toDataURL(doc.qr, { margin: 1, width: 180 });
  const c = d.cliente || {};
  const idCliente = c.contribuyente ? `RUC ${c.ruc}-${c.dv}` : c.tipoDoc === 5 ? 'Innominado' : `Doc. ${c.numDoc}`;
  const receptor = tipo === 4 ? d.autofactura?.vendedor || {} : c;

  const filas = d.items
    .map(
      (it) => `<tr>
        <td>${escapar(it.codigo || '')}</td>
        <td>${escapar(it.descripcion)}</td>
        <td class="n">${monto(it.cantidad, 'USD')}</td>
        ${conValores ? `<td class="n">${monto(it.precioUnitario, m)}</td>
        <td class="n">${monto(it.descuento * it.cantidad, m)}</td>
        <td class="n">${it.ivaTipo === 3 ? monto(it.totalOperacion, m) : ''}</td>
        <td class="n">${it.iva === 5 ? monto(it.totalOperacion, m) : ''}</td>
        <td class="n">${it.iva === 10 ? monto(it.totalOperacion, m) : ''}</td>` : ''}
      </tr>`,
    )
    .join('');

  const totales = !conValores
    ? ''
    : `<table class="tot">
        ${tipo !== 4 ? `<tr><td>Subtotal exentas</td><td class="n">${monto(t.subExento, m)}</td></tr>
        <tr><td>Subtotal 5%</td><td class="n">${monto(t.sub5, m)}</td></tr>
        <tr><td>Subtotal 10%</td><td class="n">${monto(t.sub10, m)}</td></tr>` : ''}
        <tr class="fuerte"><td>Total a pagar (${m})</td><td class="n">${MONEDAS[m]?.simbolo || m} ${monto(t.totalGeneral, m)}</td></tr>
        ${tipo !== 4 ? `<tr><td>Liquidación IVA 5%</td><td class="n">${monto(t.iva5, m)}</td></tr>
        <tr><td>Liquidación IVA 10%</td><td class="n">${monto(t.iva10, m)}</td></tr>
        <tr><td>Total IVA</td><td class="n">${monto(t.totalIva, m)}</td></tr>` : ''}
        ${m !== 'PYG' ? `<tr><td>Tipo de cambio</td><td class="n">${t.tipoCambio ? monto(t.tipoCambio, 'USD') : 'Por ítem'}</td></tr>
        <tr class="fuerte"><td>Total en guaraníes</td><td class="n">Gs. ${monto(t.totalGs, 'PYG')}</td></tr>` : ''}
      </table>`;

  const extra = [];
  if (tipo === 1 || tipo === 4) extra.push(`Condición: ${CONDICION_OPERACION[d.condicion?.tipo || 1]}${d.condicion?.tipo == 2 ? ` (${escapar(d.condicion.plazo || '30 días')})` : ''}`);
  if (tipo === 5 || tipo === 6) extra.push(`Motivo: ${MOTIVOS_NC_ND[d.motivo || 1]}`, `Documento asociado: ${cdcAgrupado(d.asociado.cdc)}`);
  if (tipo === 7) extra.push(`Motivo: ${MOTIVOS_REMISION[d.remision?.motivo || 1]}`, `Vehículo: ${escapar(d.remision?.vehiculo?.matricula || '')}`, `Inicio del traslado: ${escapar(d.remision?.fechaInicio || '')}`);
  if (d.observacion) extra.push(`Observación: ${escapar(d.observacion)}`);

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KuDE ${doc.numero}</title>
<style>
  body{font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a;margin:0;padding:24px;background:#fff}
  .hoja{max-width:820px;margin:0 auto;border:1px solid #cbd5e1;border-radius:8px;padding:24px}
  .cab{display:grid;grid-template-columns:1fr auto;gap:16px;border-bottom:2px solid #0f172a;padding-bottom:12px}
  h1{font-size:18px;margin:0 0 4px} h2{font-size:15px;margin:0}
  .muted{color:#475569}.n{text-align:right;font-variant-numeric:tabular-nums}
  .caja{border:1px solid #cbd5e1;border-radius:6px;padding:10px 12px;text-align:center;min-width:220px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin:14px 0}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{padding:6px 6px;border-bottom:1px solid #e2e8f0;vertical-align:top}
  th{background:#f1f5f9;font-size:12px;text-align:left}
  .tot{width:auto;margin-left:auto;min-width:340px}.tot td{border:0;padding:3px 6px}
  .fuerte td{font-weight:700;border-top:1px solid #0f172a}
  .pie{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin-top:18px;border-top:1px solid #e2e8f0;padding-top:14px}
  .cdc{font-family:ui-monospace,monospace;font-size:14px;font-weight:600;letter-spacing:.5px}
  .sello{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:#fee2e2;color:#991b1b}
  @media print{body{padding:0}.hoja{border:0}.noimp{display:none}}
</style></head><body>
<div class="hoja">
  <div class="cab">
    <div>
      <h1>${escapar(empresa.razon_social)}</h1>
      ${empresa.nombre_fantasia ? `<div>${escapar(empresa.nombre_fantasia)}</div>` : ''}
      <div class="muted">${escapar(empresa.act_eco_desc)}</div>
      <div class="muted">${escapar(empresa.direccion)} · ${escapar(empresa.ciu_desc)}</div>
      <div class="muted">Tel. ${escapar(empresa.telefono)} · ${escapar(empresa.email)}</div>
    </div>
    <div class="caja">
      <div>RUC <strong>${empresa.ruc}-${empresa.dv}</strong></div>
      <div>Timbrado N° <strong>${escapar(empresa.timbrado)}</strong></div>
      <div class="muted">Inicio de vigencia ${escapar(empresa.timbrado_inicio)}</div>
      <h2 style="margin-top:6px">${TIPOS_DE[tipo].nombre.toUpperCase()}</h2>
      <div class="cdc">${empresa.establecimiento}-${empresa.punto_exp}-${doc.numero}</div>
      ${doc.estado === 'cancelado' ? '<span class="sello">CANCELADO</span>' : ''}
    </div>
  </div>
  <div class="grid">
    <div><span class="muted">Fecha y hora de emisión:</span> ${doc.fecha.replace('T', ' ')}</div>
    <div><span class="muted">Moneda:</span> ${m} (${MONEDAS[m]?.nombre || m})</div>
    <div><span class="muted">${tipo === 4 ? 'Vendedor' : 'Cliente'}:</span> ${escapar(receptor.nombre || '')}</div>
    <div><span class="muted">${tipo === 4 ? 'Documento' : 'Identificación'}:</span> ${tipo === 4 ? escapar(receptor.numDoc || '') : idCliente}</div>
    ${extra.map((x) => `<div>${x}</div>`).join('')}
  </div>
  <table>
    <thead><tr><th>Cód.</th><th>Descripción</th><th class="n">Cant.</th>
    ${conValores ? '<th class="n">Precio unit.</th><th class="n">Descuento</th><th class="n">Exentas</th><th class="n">5%</th><th class="n">10%</th>' : ''}</tr></thead>
    <tbody>${filas}</tbody>
  </table>
  ${totales}
  <div class="pie">
    <img src="${qrImg}" width="140" height="140" alt="Código QR de consulta del documento">
    <div>
      <div>Consulte la validez de este documento con el número de CDC impreso abajo en:<br>
      <strong>https://ekuatia.set.gov.py/consultas/</strong></div>
      <div class="cdc" style="margin:8px 0">CDC: ${cdcAgrupado(doc.cdc)}</div>
      <div class="muted">ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN DOCUMENTO ELECTRÓNICO (XML)</div>
      <div class="muted">Si su documento electrónico presenta algún error, podrá solicitar la modificación dentro de las 72 horas siguientes de la emisión de este comprobante.</div>
    </div>
  </div>
</div>
<p class="noimp" style="text-align:center"><button onclick="print()" style="padding:10px 18px;font:inherit;cursor:pointer">Imprimir / Guardar PDF</button></p>
</body></html>`;
}

// Envío del KuDE y el XML al cliente por email usando la API de Bird
// (POST /v1/email/messages). Requiere BIRD_API_KEY y BIRD_FROM.
export async function enviarPorEmail(empresa, doc, destinatario) {
  const apiKey = process.env.BIRD_API_KEY;
  const from = process.env.BIRD_FROM;
  if (!apiKey || !from) {
    const e = new Error('El envío por email no está configurado (BIRD_API_KEY y BIRD_FROM)');
    e.status = 501;
    throw e;
  }
  const base = process.env.BIRD_API_URL || 'https://us1.platform.bird.com';
  const html = await kudeHtml(empresa, doc);
  const nombre = `${TIPOS_DE[doc.tipo].corto} ${empresa.establecimiento}-${empresa.punto_exp}-${doc.numero}`;
  const res = await fetch(`${base}/v1/email/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [destinatario],
      subject: `${nombre} · ${empresa.razon_social}`,
      html:
        `<p>Estimado cliente:</p><p>Adjuntamos su ${escapar(nombre.toLowerCase())} emitida por ` +
        `${escapar(empresa.razon_social)}.</p><p>CDC: <strong>${doc.cdc}</strong></p>` +
        '<p>Puede verificarla en https://ekuatia.set.gov.py/consultas/</p>',
      attachments: [
        { filename: `${doc.cdc}.xml`, content: Buffer.from(doc.xml).toString('base64'), content_type: 'application/xml' },
        { filename: `KuDE-${doc.cdc}.html`, content: Buffer.from(html).toString('base64'), content_type: 'text/html' },
      ],
      tags: ['timbra', `de-${doc.tipo}`],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Bird respondió ${res.status}: ${await res.text()}`);
  return res.json();
}
