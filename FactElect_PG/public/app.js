// FactElect_PG — interfaz web (SPA sin dependencias, ruteo por hash).

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');
const S = { cat: null, sesion: null, cot: null };

// ---------- Utilidades ----------
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function api(metodo, url, cuerpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: cuerpo ? { 'Content-Type': 'application/json' } : {},
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const json = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) {
    // /api/sesion es la comprobación inicial: un 401 ahí no debe sacar al usuario del registro.
    if (res.status === 401 && !['/api/login', '/api/registro', '/api/sesion'].includes(url)) {
      S.sesion = null;
      location.hash = '#/login';
    }
    const err = new Error(json?.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function toast(msg, tipo = '') {
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 4500);
}

const decimales = (m) => S.cat?.monedas[m]?.decimales ?? 2;
function fmt(v, moneda = 'PYG', conSimbolo = false) {
  const d = decimales(moneda);
  const n = new Intl.NumberFormat('es-PY', { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v) || 0);
  return conSimbolo ? `${S.cat?.monedas[moneda]?.simbolo || moneda} ${n}` : n;
}
const fmtNum = (v, d = 2) => new Intl.NumberFormat('es-PY', { maximumFractionDigits: d }).format(Number(v) || 0);
const fecha = (s) => (s ? s.replace('T', ' ').slice(0, 16) : '');
const nroDoc = (e, d) => `${e.establecimiento}-${e.puntoExp}-${d.numero}`;

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

async function conCarga(btn, fn) {
  const txt = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spin" aria-hidden="true"></span> Procesando…`;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.innerHTML = txt;
  }
}

function datosForm(form) {
  const o = {};
  for (const [k, v] of new FormData(form)) o[k] = typeof v === 'string' ? v.trim() : v;
  return o;
}

// ---------- Iconos (trazos de Lucide, ISC) ----------
const P = {
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  arrow: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
};
const icon = (n, label) =>
  `<svg class="i" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${P[n]}</svg>`;

const badge = (estado) => `<span class="badge b-${esc(estado)}">${esc(estado[0].toUpperCase() + estado.slice(1))}</span>`;

// ---------- Layout ----------
const NAV = [
  ['panel', 'Panel', 'home'],
  ['documentos', 'Documentos', 'file'],
  ['clientes', 'Clientes', 'users'],
  ['productos', 'Productos', 'box'],
  ['cotizaciones', 'Cotizaciones', 'coins'],
  ['planes', 'Plan y facturación', 'card'],
  ['soporte', 'Soporte', 'help'],
  ['configuracion', 'Configuración', 'gear'],
];
const AMBIENTES = { simulado: 'Modo simulado', test: 'SIFEN test', prod: 'SIFEN producción' };

function logo() {
  return `<a class="logo" href="#/panel"><span class="logo-mark">${icon('zap')}</span><span><b>FactElect_PG</b><small>Facturación electrónica</small></span></a>`;
}

function layout(activo, contenido) {
  const e = S.sesion.empresa;
  const ambClase = e.ambiente === 'prod' ? 'ok' : e.ambiente === 'test' ? 'warn' : '';
  app.innerHTML = `
  <div class="shell">
    <nav class="side" id="side" aria-label="Navegación principal">
      ${logo()}
      <div class="nav">
        <a class="cta" href="#/emitir" ${activo === 'emitir' ? 'aria-current="page"' : ''}>${icon('plus')} Emitir documento</a>
        ${NAV.map(([r, t, i]) => `<a href="#/${r}" ${activo === r ? 'aria-current="page"' : ''}>${icon(i)} ${t}</a>`).join('')}
      </div>
      <div class="side-foot">
        <div><strong style="color:#fff">${esc(e.razonSocial)}</strong></div>
        <div class="mono">RUC ${esc(e.ruc)}-${e.dv}</div>
        <button class="btn sm ghost" id="salir" style="color:#cbd5e1;padding:0">${icon('logout')} Cerrar sesión</button>
      </div>
    </nav>
    <div class="main">
      <header class="top">
        <button class="btn ghost menu-btn" id="menu" aria-label="Abrir menú" aria-controls="side" aria-expanded="false">${icon('menu')}</button>
        <span class="badge ${ambClase ? 'b-' + (ambClase === 'ok' ? 'aprobado' : 'pendiente') : 'b-cancelado'} amb">${AMBIENTES[e.ambiente]}</span>
        <span class="spacer"></span>
        <span class="muted small">Hola, ${esc(S.sesion.usuario.nombre)}</span>
      </header>
      <main class="content" id="contenido">${contenido}</main>
    </div>
  </div>`;
  $('#salir').onclick = async () => {
    await api('POST', '/api/logout');
    S.sesion = null;
    location.hash = '#/login';
  };
  const side = $('#side');
  $('#menu').onclick = (ev) => {
    side.classList.toggle('open');
    ev.currentTarget.setAttribute('aria-expanded', side.classList.contains('open'));
  };
  side.addEventListener('click', (ev) => {
    if (ev.target.closest('a')) side.classList.remove('open');
  });
}

const cabecera = (eyebrow, titulo, sub = '', acciones = '') =>
  `<div class="head"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${titulo}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="row">${acciones}</div></div>`;

// ---------- Autenticación y onboarding ----------
function heroAuth() {
  return `<section class="auth-hero">
    ${logo()}
    <div class="tags">Solución SIFEN · DNIT Paraguay · Multidivisa</div>
    <h1>Facturación electrónica <em>simple y eficiente</em></h1>
    <ul>
      <li>${icon('check')} Plataforma 100% web: sin instalaciones, desde cualquier dispositivo.</li>
      <li>${icon('check')} Multidivisa nativa: Gs., USD, EUR, BRL, ARS y más, con el total en guaraníes calculado.</li>
      <li>${icon('check')} Facturas, notas de crédito y débito, notas de remisión y autofacturas.</li>
      <li>${icon('check')} Firma digital, CDC y QR según el Manual Técnico SIFEN v150.</li>
      <li>${icon('check')} Alta y configuración 100% online.</li>
    </ul>
  </section>`;
}

function vistaLogin() {
  app.innerHTML = `<div class="auth">${heroAuth()}
    <section class="auth-form">
      <div class="eyebrow">Acceso</div>
      <h1 style="margin-bottom:20px">Ingresá a tu cuenta</h1>
      <form id="f" class="grid" novalidate>
        <label class="f">Email <input name="email" type="email" autocomplete="email" required></label>
        <label class="f">Contraseña <input name="password" type="password" autocomplete="current-password" required></label>
        <div id="err" role="alert"></div>
        <button class="btn primary" type="submit">Ingresar</button>
        <p class="muted">¿Todavía no tenés cuenta? <a href="#/registro">Creá tu cuenta en minutos</a></p>
      </form>
    </section></div>`;
  $('#f').onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = ev.submitter;
    try {
      await conCarga(btn, () => api('POST', '/api/login', datosForm(ev.target)));
      await cargarSesion();
      location.hash = '#/panel';
    } catch (e) {
      $('#err').innerHTML = `<div class="alert err">${esc(e.message)}</div>`;
    }
  };
}

function camposEmpresa(e = {}) {
  return `
  <div class="grid g2">
    <label class="f">RUC (sin DV) <input name="ruc" inputmode="numeric" maxlength="8" required value="${esc(e.ruc)}">
      <span class="help" id="dvInfo">${e.dv !== undefined ? `DV: ${e.dv}` : 'El dígito verificador se calcula solo'}</span></label>
    <label class="f">Tipo de contribuyente
      <select name="tipoContribuyente"><option value="1" ${e.tipoContribuyente == 1 ? 'selected' : ''}>Persona física</option><option value="2" ${e.tipoContribuyente == 2 ? 'selected' : ''}>Persona jurídica</option></select></label>
    <label class="f">Razón social <input name="razonSocial" required value="${esc(e.razonSocial)}"></label>
    <label class="f">Nombre de fantasía <span class="help">Opcional</span><input name="nombreFantasia" value="${esc(e.nombreFantasia)}"></label>
    <label class="f">Actividad económica (código) <input name="actEcoCod" inputmode="numeric" required value="${esc(e.actEcoCod)}"><span class="help">Según su constancia de RUC</span></label>
    <label class="f">Actividad económica (descripción) <input name="actEcoDesc" required value="${esc(e.actEcoDesc)}"></label>
    <label class="f">Dirección <input name="direccion" required value="${esc(e.direccion)}"></label>
    <label class="f">Número de casa <input name="numCasa" value="${esc(e.numCasa ?? '0')}"></label>
    <label class="f">Departamento (código / nombre)
      <span class="row"><input name="depCod" inputmode="numeric" style="width:90px" value="${esc(e.depCod ?? 1)}"><input name="depDesc" style="flex:1" value="${esc(e.depDesc ?? 'CAPITAL')}"></span></label>
    <label class="f">Ciudad (código / nombre)
      <span class="row"><input name="ciuCod" inputmode="numeric" style="width:90px" value="${esc(e.ciuCod ?? 1)}"><input name="ciuDesc" style="flex:1" value="${esc(e.ciuDesc ?? 'ASUNCION (DISTRITO)')}"></span>
      <span class="help">Códigos de la tabla de ciudades del SIFEN</span></label>
    <label class="f">Teléfono <input name="telefono" type="tel" required value="${esc(e.telefono)}"></label>
    <label class="f">Email de facturación <input name="email" type="email" required value="${esc(e.email)}"></label>
  </div>
  <h3 style="margin:22px 0 12px">Timbrado</h3>
  <div class="grid g4">
    <label class="f">N° de timbrado <input name="timbrado" inputmode="numeric" maxlength="8" required value="${esc(e.timbrado)}"></label>
    <label class="f">Inicio de vigencia <input name="timbradoInicio" type="date" required value="${esc(e.timbradoInicio)}"></label>
    <label class="f">Establecimiento <input name="establecimiento" inputmode="numeric" maxlength="3" value="${esc(e.establecimiento ?? '001')}"></label>
    <label class="f">Punto de expedición <input name="puntoExp" inputmode="numeric" maxlength="3" value="${esc(e.puntoExp ?? '001')}"></label>
  </div>`;
}

function enlazarDV(form) {
  const ruc = form.elements.ruc;
  ruc.addEventListener(
    'input',
    debounce(async () => {
      const v = ruc.value.replace(/\D/g, '');
      if (!v) return;
      try {
        const r = await api('GET', `/api/ruc/${v}/dv`);
        $('#dvInfo', form).textContent = `RUC completo: ${r.ruc}-${r.dv}`;
      } catch {}
    }, 300),
  );
}

function vistaRegistro() {
  let paso = 1;
  let planElegido = 'estandar';
  app.innerHTML = `<div class="auth">${heroAuth()}
    <section class="auth-form">
      <div class="steps" aria-label="Pasos del alta"><span data-p="1">1 · Tu cuenta</span><span data-p="2">2 · Tu empresa</span><span data-p="3">3 · Tu plan</span></div>
      <form id="f" novalidate>
        <div data-paso="1" class="grid">
          <h1>Creá tu cuenta</h1>
          <p class="muted" style="margin:0">Todo el alta es online. Empezás en modo simulado y pasás a producción cuando cargues tu certificado.</p>
          <label class="f">Nombre y apellido <input name="nombre" autocomplete="name" required></label>
          <label class="f">Email <input name="uemail" type="email" autocomplete="email" required></label>
          <label class="f">Contraseña <span class="help">Mínimo 8 caracteres</span><input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        </div>
        <div data-paso="2" hidden><h1 style="margin-bottom:16px">Datos de tu empresa</h1>${camposEmpresa()}</div>
        <div data-paso="3" hidden><h1 style="margin-bottom:16px">Elegí tu plan</h1><div class="grid g3" id="planes"></div>
          <p class="muted small">Sin permanencia. Podés subir o bajar de plan en cualquier momento.</p></div>
        <div id="err" role="alert" style="margin-top:14px"></div>
        <div class="row" style="margin-top:18px">
          <button class="btn" type="button" id="atras" hidden>${icon('arrow')} Atrás</button><span class="spacer"></span>
          <button class="btn primary" type="submit" id="sig">Continuar</button>
        </div>
        <p class="muted">¿Ya tenés cuenta? <a href="#/login">Ingresá</a></p>
      </form>
    </section></div>`;
  const form = $('#f');
  enlazarDV(form);
  $('#planes').innerHTML = tarjetasPlanes(planElegido, true);
  $('#planes').onclick = (ev) => {
    const b = ev.target.closest('[data-plan]');
    if (!b) return;
    planElegido = b.dataset.plan;
    $('#planes').innerHTML = tarjetasPlanes(planElegido, true);
  };
  const mostrar = () => {
    $$('[data-paso]', form).forEach((d) => (d.hidden = Number(d.dataset.paso) !== paso));
    $$('.steps span').forEach((s) => s.setAttribute('aria-current', Number(s.dataset.p) === paso ? 'step' : 'false'));
    $('#atras').hidden = paso === 1;
    $('#sig').textContent = paso === 3 ? 'Crear cuenta' : 'Continuar';
    $('#err').innerHTML = '';
    $(`[data-paso="${paso}"] input, [data-paso="${paso}"] button`, form)?.focus();
  };
  $('#atras').onclick = () => {
    paso--;
    mostrar();
  };
  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const bloque = $(`[data-paso="${paso}"]`, form);
    const invalido = $$('input[required]', bloque).find((i) => !i.checkValidity());
    if (invalido) {
      $('#err').innerHTML = `<div class="alert err">Revisá el campo «${esc(invalido.closest('label').firstChild.textContent.trim())}»</div>`;
      invalido.setAttribute('aria-invalid', 'true');
      invalido.focus();
      return;
    }
    if (paso < 3) {
      paso++;
      return mostrar();
    }
    const d = datosForm(form);
    try {
      await conCarga(ev.submitter, () =>
        api('POST', '/api/registro', { usuario: { nombre: d.nombre, email: d.uemail, password: d.password }, empresa: d, plan: planElegido }),
      );
      await cargarSesion();
      toast('¡Cuenta creada! Ya podés emitir en modo simulado.');
      location.hash = '#/panel';
    } catch (e) {
      $('#err').innerHTML = `<div class="alert err">${esc(e.message)}</div>`;
    }
  };
  mostrar();
}

const NOMBRE_TIPO = { 1: 'Facturas', 5: 'N. crédito', 6: 'N. débito', 7: 'N. remisión', 4: 'Autofact.' };
function tarjetasPlanes(actual, elegible) {
  return Object.entries(S.cat.planes)
    .map(
      ([id, p]) => `<div class="card plan ${p.destacado ? 'dest' : ''}">
      ${p.destacado ? '<span class="tag">MÁS ELEGIDO</span>' : ''}
      <div class="eyebrow">Plan ${esc(p.nombre)}</div>
      <div class="precio">Gs. ${fmt(p.precio)} <small>/ mes</small></div>
      <p class="muted small" style="margin:0">${esc(p.descripcion)}</p>
      <ul><li>${p.documentosMes} documentos / mes</li><li>Hasta ${p.productos} productos</li><li>Clientes y timbrados ilimitados</li><li>Multidivisa incluida</li></ul>
      <div class="tipos">${[1, 5, 6, 7, 4].map((t) => `<span class="chip ${p.tipos.includes(t) ? '' : 'off'}">${NOMBRE_TIPO[t]}</span>`).join('')}</div>
      <button type="button" class="btn ${id === actual ? 'primary' : ''}" data-plan="${id}" ${!elegible && id === actual ? 'disabled' : ''} aria-pressed="${id === actual}">
        ${id === actual ? `${icon('check')} ${elegible ? 'Elegido' : 'Plan actual'}` : 'Elegir'}</button>
    </div>`,
    )
    .join('');
}

// ---------- Panel ----------
function graficoDias(porDia) {
  const dias = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' });
    const r = porDia.find((x) => x.dia === d);
    dias.push({ dia: d, total: r?.total_gs || 0, cantidad: r?.cantidad || 0 });
  }
  const max = Math.max(...dias.map((d) => d.total), 1);
  const W = 720, H = 220, top = 12, bottom = 30, left = 4;
  const ancho = (W - left) / dias.length;
  const alto = H - top - bottom;
  const barra = Math.max(ancho - 2, 2);
  const marcas = [0, 0.5, 1].map((f) => `<line class="grid-line" x1="0" x2="${W}" y1="${top + alto * (1 - f)}" y2="${top + alto * (1 - f)}"/>`).join('');
  const barras = dias
    .map((d, i) => {
      const h = d.total ? Math.max((d.total / max) * alto, 3) : 0;
      const x = left + i * ancho;
      const y = top + alto - h;
      const r = Math.min(4, h / 2, barra / 2);
      const path = h
        ? `M${x},${top + alto} V${y + r} Q${x},${y} ${x + r},${y} H${x + barra - r} Q${x + barra},${y} ${x + barra},${y + r} V${top + alto} Z`
        : '';
      return `<rect class="hit" x="${x}" y="${top}" width="${ancho}" height="${alto}" data-i="${i}"/>${path ? `<path class="bar" d="${path}"/>` : ''}`;
    })
    .join('');
  const etiquetas = [0, 10, 20, 29]
    .map((i) => `<text class="axis" x="${i === 29 ? W : i === 0 ? left : left + i * ancho + barra / 2}" y="${H - 6}" text-anchor="${i === 29 ? 'end' : i === 0 ? 'start' : 'middle'}">${dias[i].dia.slice(8)}/${dias[i].dia.slice(5, 7)}</text>`)
    .join('');
  const html = `<div class="chart" id="chart">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Facturación aprobada por día en guaraníes, últimos 30 días. Máximo Gs. ${fmt(max)}.">${marcas}${barras}${etiquetas}</svg>
      <div class="tip" hidden></div>
    </div>
    <details style="margin-top:8px"><summary class="small muted" style="cursor:pointer">Ver como tabla</summary>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Día</th><th class="num">Documentos</th><th class="num">Total Gs.</th></tr></thead>
      <tbody>${dias.filter((d) => d.cantidad).map((d) => `<tr><td>${d.dia}</td><td class="num">${d.cantidad}</td><td class="num">${fmt(d.total)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Sin facturación en el período</td></tr>'}</tbody></table></div>
    </details>`;
  const enlazar = () => {
    const cont = $('#chart');
    const tip = $('.tip', cont);
    cont.addEventListener('mouseover', (ev) => {
      const hit = ev.target.closest('.hit');
      if (!hit) return;
      const d = dias[hit.dataset.i];
      const rect = cont.getBoundingClientRect();
      const hr = hit.getBoundingClientRect();
      tip.innerHTML = `<strong>${d.dia}</strong> · Gs. ${fmt(d.total)} · ${d.cantidad} doc.`;
      tip.style.left = `${hr.left - rect.left + hr.width / 2}px`;
      tip.style.top = `${Math.max(hr.top - rect.top + 40, 30)}px`;
      tip.hidden = false;
    });
    cont.addEventListener('mouseleave', () => (tip.hidden = true));
  };
  return { html, enlazar };
}

async function vistaPanel() {
  layout('panel', '<p class="muted">Cargando…</p>');
  const d = await api('GET', '/api/panel');
  const e = S.sesion.empresa;
  const pct = Math.min(100, Math.round((d.usados / d.plan.documentosMes) * 100));
  const totalGs = d.porMoneda.reduce((a, m) => a + m.total_gs, 0);
  const g = graficoDias(d.porDia);
  const avisos = [];
  if (e.ambiente === 'simulado') {
    avisos.push(`<div class="alert warn">${icon('help')}<div>Estás en <strong>modo simulado</strong>: los documentos se firman y generan su QR, pero no se envían a la DNIT. Cargá tu certificado y CSC en <a href="#/configuracion">Configuración</a> para pasar a test o producción.</div></div>`);
  }
  if (pct >= 80) avisos.push(`<div class="alert warn">Usaste el ${pct}% del cupo mensual. <a href="#/planes">Ver planes</a></div>`);
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Resumen del mes', 'Panel', esc(e.razonSocial), `<a class="btn primary" href="#/emitir">${icon('plus')} Emitir documento</a>`)}
    ${avisos.length ? `<div class="grid" style="margin-bottom:16px">${avisos.join('')}</div>` : ''}
    <div class="grid g4">
      <div class="card kpi"><div class="lbl">Documentos del mes</div><div class="val">${d.usados} <span class="muted small">/ ${d.plan.documentosMes}</span></div>
        <div class="meter ${pct >= 80 ? 'alto' : ''}" role="meter" aria-valuemin="0" aria-valuemax="${d.plan.documentosMes}" aria-valuenow="${d.usados}" aria-label="Cupo mensual usado"><span style="width:${pct}%"></span></div>
        <div class="sub">Plan ${esc(d.plan.nombre)}</div></div>
      <div class="card kpi"><div class="lbl">Facturado (equiv. Gs.)</div><div class="val">${fmt(totalGs)}</div><div class="sub">Facturas y autofacturas aprobadas</div></div>
      <div class="card kpi"><div class="lbl">Clientes</div><div class="val">${d.clientes}</div><div class="sub"><a href="#/clientes">Gestionar</a></div></div>
      <div class="card kpi"><div class="lbl">Productos</div><div class="val">${d.productos} <span class="muted small">/ ${d.plan.productos}</span></div><div class="sub"><a href="#/productos">Catálogo</a></div></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h2>Facturación diaria · Gs.</h2>${g.html}</div>
      <div class="card"><h2>Por moneda · este mes</h2>
        ${d.porMoneda.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Moneda</th><th class="num">Docs.</th><th class="num">Total en moneda</th><th class="num">Equiv. Gs.</th></tr></thead><tbody>
        ${d.porMoneda.map((m) => `<tr><td><span class="chip">${esc(m.moneda)}</span></td><td class="num">${m.cantidad}</td><td class="num">${fmt(m.total, m.moneda, true)}</td><td class="num">${fmt(m.total_gs)}</td></tr>`).join('')}
        </tbody></table></div>` : `<div class="empty">${icon('coins')}<div>Todavía no hay facturas aprobadas este mes.</div></div>`}
      </div>
    </div>
    <div class="card" style="margin-top:16px"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Últimos documentos</h2><span class="spacer"></span><a href="#/documentos">Ver todos</a></div>
      ${tablaDocs(d.recientes)}</div>`;
  g.enlazar();
  enlazarTablaDocs();
}

function tablaDocs(docs) {
  if (!docs.length) return `<div class="empty">${icon('file')}<div>No hay documentos todavía.</div><p><a class="btn primary" href="#/emitir">Emitir el primero</a></p></div>`;
  const e = S.sesion.empresa;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Documento</th><th>Número</th><th>Fecha</th><th>Cliente</th><th class="num">Total</th><th class="num">Equiv. Gs.</th><th>Estado</th></tr></thead><tbody>
    ${docs.map((d) => `<tr class="click" data-id="${d.id}" tabindex="0"><td>${esc(S.cat.tipos[d.tipo].corto)}</td><td class="mono">${nroDoc(e, d)}</td><td>${fecha(d.fecha)}</td><td>${esc(d.cliente || '')}</td>
      <td class="num">${d.tipo === 7 ? '—' : fmt(d.total, d.moneda, true)}</td><td class="num">${d.tipo === 7 ? '—' : fmt(d.totalGs)}</td><td>${badge(d.estado)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function enlazarTablaDocs() {
  $$('tr.click[data-id]').forEach((tr) => {
    const ir = () => (location.hash = `#/documentos/${tr.dataset.id}`);
    tr.onclick = ir;
    tr.onkeydown = (ev) => ev.key === 'Enter' && ir();
  });
}

// ---------- Emisión ----------
function itemVacio() {
  return { codigo: '', descripcion: '', cantidad: 1, precioUnitario: 0, descuento: 0, iva: 10, tipoCambio: '' };
}

async function vistaEmitir(params) {
  layout('emitir', '<p class="muted">Cargando…</p>');
  const [clientes, productos, cot, aprobados] = await Promise.all([
    api('GET', '/api/clientes'),
    api('GET', '/api/productos'),
    api('GET', '/api/cotizaciones'),
    api('GET', '/api/documentos?aprobados=1'),
  ]);
  S.cot = cot;
  const e = S.sesion.empresa;
  const plan = S.cat.planes[e.plan];
  const F = {
    tipo: 1, moneda: 'PYG', tipoCambio: '', porItem: false, cliente: '', tipoTransaccion: 1,
    condicion: { tipo: 1, pagoTipo: 1, plazo: '30 días' }, items: [itemVacio()], asociado: '', motivo: 1, observacion: '',
    remision: { motivo: 1, responsable: 1, fechaInicio: new Date().toLocaleDateString('en-CA'), salida: {}, entrega: {}, vehiculo: {}, transportista: {} },
    autofactura: { vendedor: { tipoDoc: 1 }, constancia: {} },
  };

  // Precarga de nota de crédito/débito desde un documento.
  if (params.get('desde')) {
    const base = await api('GET', `/api/documentos/${params.get('desde')}`);
    Object.assign(F, {
      tipo: Number(params.get('tipo') || 5), moneda: base.moneda, tipoCambio: base.tipoCambio || '',
      cliente: base.datos.clienteId ? String(base.datos.clienteId) : base.datos.cliente?.tipoDoc === 5 ? 'innominado' : '',
      asociado: base.cdc,
      items: base.datos.items.map((it) => ({ codigo: it.codigo || '', descripcion: it.descripcion, cantidad: it.cantidad, precioUnitario: it.precioUnitario, descuento: it.descuento || 0, iva: it.iva ?? 0, tipoCambio: it.tipoCambio || '' })),
    });
  }

  const tasa = (m) => (m === 'PYG' ? 1 : Number(S.cot.monedas[m]?.valor) || 0);
  const opcionesClientes = () =>
    `<option value="">Seleccioná un cliente…</option><option value="innominado" ${F.cliente === 'innominado' ? 'selected' : ''}>Consumidor final (sin nombre)</option>` +
    clientes.map((c) => `<option value="${c.id}" ${String(c.id) === F.cliente ? 'selected' : ''}>${esc(c.nombre)} · ${c.contribuyente ? `RUC ${esc(c.ruc)}-${c.dv}` : `Doc. ${esc(c.num_doc)}`}</option>`).join('');

  document.getElementById('contenido').innerHTML = `
    ${cabecera('Nuevo documento electrónico', 'Emitir', `Se firma con su certificado, se genera el CDC y el QR, y se transmite al SIFEN (${AMBIENTES[e.ambiente].toLowerCase()}).`)}
    <form id="fe" novalidate>
      <div class="card">
        <fieldset><legend>Tipo de documento</legend>
          <div class="seg" id="tipos">${[1, 5, 6, 7, 4].map((t) => {
            const ok = plan.tipos.includes(t);
            return `<button type="button" data-tipo="${t}" aria-pressed="${F.tipo === t}" ${ok ? '' : `disabled title="No incluido en su plan"`}>${ok ? '' : icon('lock')}${esc(S.cat.tipos[t].corto)}</button>`;
          }).join('')}</div>
        </fieldset>
      </div>
      <div class="card" id="bloqueReceptor"></div>
      <div class="card" id="bloqueMoneda"></div>
      <div class="card" id="bloqueEspecifico"></div>
      <div class="card">
        <div class="row" style="margin-bottom:12px"><h2 style="margin:0">Ítems</h2><span class="spacer"></span>
          <label class="sr" for="buscarProd">Agregar producto del catálogo</label>
          <input id="buscarProd" list="dlProd" placeholder="Buscar producto del catálogo…" style="max-width:320px">
          <datalist id="dlProd">${productos.map((p) => `<option value="${esc(p.codigo)} · ${esc(p.descripcion)}">`).join('')}</datalist>
          <button type="button" class="btn sm" id="addItem">${icon('plus')} Ítem libre</button></div>
        <div class="tbl-wrap"><table class="tbl" id="tablaItems"></table></div>
      </div>
      <div class="card"><label class="f">Observación <span class="help">Opcional, se imprime en el KuDE</span><textarea name="observacion" maxlength="3000">${esc(F.observacion)}</textarea></label></div>
      <div class="sticky-foot">
        <div id="totales" class="totales" aria-live="polite"></div><span class="spacer"></span>
        <div id="errEmitir" role="alert"></div>
        <button type="submit" class="btn primary">${icon('zap')} Firmar y emitir</button>
      </div>
    </form>`;

  const conValores = () => F.tipo !== 7;

  function renderReceptor() {
    const b = $('#bloqueReceptor');
    if (F.tipo === 4) {
      const v = F.autofactura.vendedor;
      b.innerHTML = `<h2>Vendedor (no contribuyente)</h2><div class="grid g3">
        <label class="f">Tipo de documento <select data-k="af.tipoDoc">${[1, 2, 3, 4].map((t) => `<option value="${t}" ${v.tipoDoc == t ? 'selected' : ''}>${S.cat.tiposId[t]}</option>`).join('')}</select></label>
        <label class="f">N° de documento <input data-k="af.numDoc" value="${esc(v.numDoc)}" required></label>
        <label class="f">Nombre y apellido <input data-k="af.nombre" value="${esc(v.nombre)}" required></label>
        <label class="f">Dirección <input data-k="af.direccion" value="${esc(v.direccion)}" required></label>
        <label class="f">N° de constancia de no contribuyente <span class="help">Opcional</span><input data-k="afc.numero" value="${esc(F.autofactura.constancia.numero)}"></label>
        <label class="f">N° de control de la constancia <span class="help">Opcional</span><input data-k="afc.control" value="${esc(F.autofactura.constancia.control)}"></label></div>`;
      return;
    }
    b.innerHTML = `<div class="row" style="margin-bottom:12px"><h2 style="margin:0">Cliente</h2><span class="spacer"></span><a href="#/clientes?nuevo=1" class="small">${icon('plus')} Nuevo cliente</a></div>
      <label class="f"><span class="sr">Cliente</span><select data-k="cliente" required>${opcionesClientes()}</select></label>`;
  }

  function renderMoneda() {
    const b = $('#bloqueMoneda');
    if (!conValores()) {
      b.innerHTML = `<h2>Traslado</h2><p class="muted small" style="margin:0">La nota de remisión no lleva valores ni moneda.</p>`;
      return;
    }
    const ext = F.moneda !== 'PYG';
    const c = S.cot.monedas[F.moneda];
    b.innerHTML = `<h2>Moneda y condiciones</h2>
      <div class="grid g4">
        <label class="f">Moneda de la operación <select data-k="moneda">${Object.entries(S.cat.monedas).map(([k, m]) => `<option value="${k}" ${k === F.moneda ? 'selected' : ''}>${k} · ${esc(m.nombre)}</option>`).join('')}</select></label>
        ${ext ? `<label class="f">Tipo de cambio (Gs. por 1 ${F.moneda})
          <input data-k="tipoCambio" inputmode="decimal" value="${esc(F.tipoCambio)}" ${F.porItem ? 'disabled' : 'required'}>
          <span class="help">${c ? `Referencia ${esc(c.fuente)}: ${fmtNum(c.valor)}` : 'Sin cotización de referencia: cargala a mano'}</span></label>
          <label class="check" style="align-self:end"><input type="checkbox" data-k="porItem" ${F.porItem ? 'checked' : ''}> Tipo de cambio por ítem</label>` : ''}
        ${F.tipo === 1 || F.tipo === 4 ? `<label class="f">Tipo de transacción <select data-k="tipoTransaccion">${Object.entries(S.cat.tiposTransaccion).map(([k, t]) => `<option value="${k}" ${k == F.tipoTransaccion ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>` : ''}
      </div>
      ${F.tipo === 1 || F.tipo === 4 ? `<div class="grid g4" style="margin-top:14px">
        <label class="f">Condición <select data-k="cond.tipo"><option value="1" ${F.condicion.tipo == 1 ? 'selected' : ''}>Contado</option><option value="2" ${F.condicion.tipo == 2 ? 'selected' : ''}>Crédito</option></select></label>
        ${F.condicion.tipo == 1
          ? `<label class="f">Forma de pago <select data-k="cond.pagoTipo">${Object.entries(S.cat.tiposPago).map(([k, t]) => `<option value="${k}" ${k == F.condicion.pagoTipo ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`
          : `<label class="f">Plazo <input data-k="cond.plazo" value="${esc(F.condicion.plazo)}"></label>`}
      </div>` : ''}`;
  }

  function renderEspecifico() {
    const b = $('#bloqueEspecifico');
    if (F.tipo === 5 || F.tipo === 6) {
      b.hidden = false;
      b.innerHTML = `<h2>Documento asociado</h2><div class="grid g2">
        <label class="f">Factura de origen <select data-k="asociadoSel"><option value="">Elegir una factura aprobada…</option>
          ${aprobados.map((d) => `<option value="${d.cdc}" ${d.cdc === F.asociado ? 'selected' : ''}>${nroDoc(e, d)} · ${esc(d.cliente || '')} · ${fmt(d.total, d.moneda, true)}</option>`).join('')}</select></label>
        <label class="f">CDC (44 dígitos) <input data-k="asociado" class="mono" inputmode="numeric" maxlength="44" value="${esc(F.asociado)}" required></label>
        <label class="f">Motivo <select data-k="motivo">${Object.entries(S.cat.motivosNC).map(([k, t]) => `<option value="${k}" ${k == F.motivo ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label></div>`;
    } else if (F.tipo === 7) {
      const r = F.remision;
      b.hidden = false;
      b.innerHTML = `<h2>Datos del traslado</h2><div class="grid g3">
        <label class="f">Motivo <select data-k="r.motivo">${Object.entries(S.cat.motivosRemision).map(([k, t]) => `<option value="${k}" ${k == r.motivo ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
        <label class="f">Responsable de la emisión <select data-k="r.responsable">${Object.entries(S.cat.responsablesRemision).map(([k, t]) => `<option value="${k}" ${k == r.responsable ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
        <label class="f">Inicio del traslado <input type="date" data-k="r.fechaInicio" value="${esc(r.fechaInicio)}" required></label>
        <label class="f">Dirección de salida <input data-k="r.salida.direccion" value="${esc(r.salida.direccion)}" required></label>
        <label class="f">Dirección de entrega <input data-k="r.entrega.direccion" value="${esc(r.entrega.direccion)}" required></label>
        <label class="f">Matrícula del vehículo <input data-k="r.vehiculo.matricula" value="${esc(r.vehiculo.matricula)}" required></label>
        <label class="f">Marca del vehículo <input data-k="r.vehiculo.marca" value="${esc(r.vehiculo.marca)}"></label>
        <label class="f">Transportista <span class="help">Opcional</span><input data-k="r.transportista.nombre" value="${esc(r.transportista.nombre)}"></label>
        <label class="f">RUC del transportista <span class="help">Sin DV, opcional</span><input data-k="r.transportista.ruc" value="${esc(r.transportista.ruc)}"></label>
        <label class="f">Nombre del chofer <input data-k="r.transportista.choferNombre" value="${esc(r.transportista.choferNombre)}"></label>
        <label class="f">Documento del chofer <input data-k="r.transportista.choferDoc" value="${esc(r.transportista.choferDoc)}"></label></div>`;
    } else {
      b.hidden = true;
      b.innerHTML = '';
    }
  }

  function renderItems() {
    const porItem = F.moneda !== 'PYG' && F.porItem && conValores();
    $('#tablaItems').innerHTML = `<thead><tr><th>Código</th><th style="min-width:220px">Descripción</th><th class="num">Cantidad</th>
      ${conValores() ? `<th class="num">Precio unit. (IVA incl.)</th><th class="num">Descuento unit.</th><th>IVA</th>${porItem ? '<th class="num">T. cambio</th>' : ''}<th class="num">Total</th>` : ''}<th><span class="sr">Quitar</span></th></tr></thead>
      <tbody>${F.items.map((it, i) => `<tr data-i="${i}">
        <td><input aria-label="Código del ítem ${i + 1}" data-f="codigo" value="${esc(it.codigo)}" style="width:90px"></td>
        <td><input aria-label="Descripción del ítem ${i + 1}" data-f="descripcion" value="${esc(it.descripcion)}" required></td>
        <td><input aria-label="Cantidad del ítem ${i + 1}" data-f="cantidad" inputmode="decimal" value="${esc(it.cantidad)}" style="width:90px;text-align:right"></td>
        ${conValores() ? `<td><input aria-label="Precio del ítem ${i + 1}" data-f="precioUnitario" inputmode="decimal" value="${esc(it.precioUnitario)}" style="width:130px;text-align:right"></td>
        <td><input aria-label="Descuento del ítem ${i + 1}" data-f="descuento" inputmode="decimal" value="${esc(it.descuento)}" style="width:110px;text-align:right"></td>
        <td><select aria-label="IVA del ítem ${i + 1}" data-f="iva" style="width:96px">${[10, 5, 0].map((t) => `<option value="${t}" ${Number(it.iva) === t ? 'selected' : ''}>${t ? t + '%' : 'Exento'}</option>`).join('')}</select></td>
        ${porItem ? `<td><input aria-label="Tipo de cambio del ítem ${i + 1}" data-f="tipoCambio" inputmode="decimal" value="${esc(it.tipoCambio)}" style="width:100px;text-align:right"></td>` : ''}
        <td class="num" data-total="${i}">—</td>` : ''}
        <td><button type="button" class="btn sm ghost danger" data-quitar="${i}" aria-label="Quitar ítem ${i + 1}" ${F.items.length === 1 ? 'disabled' : ''}>${icon('trash')}</button></td>
      </tr>`).join('')}</tbody>`;
    recalcular();
  }

  const num = (v) => Number(String(v).replace(/\s/g, '').replace(',', '.'));

  const recalcular = debounce(async () => {
    const z = $('#totales');
    if (!z) return;
    if (!conValores()) {
      z.innerHTML = `<div><span>Ítems</span><strong>${F.items.length}</strong></div>`;
      return;
    }
    try {
      const r = await api('POST', '/api/calcular', cuerpoCalculo());
      r.items.forEach((it, i) => {
        const td = $(`[data-total="${i}"]`);
        if (td) td.textContent = fmt(it.totalOperacion, F.moneda);
      });
      const t = r.totales;
      z.innerHTML = `
        ${F.tipo !== 4 ? `<div class="small muted"><span>IVA 10% / 5%</span><span class="num">${fmt(t.iva10, F.moneda)} / ${fmt(t.iva5, F.moneda)}</span></div>` : ''}
        <div class="big"><span>Total ${F.moneda}</span><span class="num">${fmt(t.totalGeneral, F.moneda, true)}</span></div>
        ${t.totalGs !== undefined ? `<div><span class="muted">Equivalente en guaraníes</span><strong class="num">Gs. ${fmt(t.totalGs)}</strong></div>` : ''}`;
    } catch (err) {
      z.innerHTML = `<div class="small muted">${esc(err.message)}</div>`;
    }
  }, 250);

  function cuerpoCalculo() {
    return {
      tipo: F.tipo, moneda: F.moneda, condicionTipoCambio: F.porItem ? 2 : 1, tipoCambio: num(F.tipoCambio),
      items: F.items.map((it) => ({
        ...it, cantidad: num(it.cantidad), precioUnitario: num(it.precioUnitario), descuento: num(it.descuento) || 0,
        iva: Number(it.iva), ivaTipo: Number(it.iva) ? 1 : 3, tipoCambio: num(it.tipoCambio),
      })),
    };
  }

  function renderTodo() {
    $$('#tipos button').forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.tipo) === F.tipo));
    renderReceptor();
    renderMoneda();
    renderEspecifico();
    renderItems();
  }

  function setRuta(obj, ruta, valor) {
    const p = ruta.split('.');
    let o = obj;
    p.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
    o[p.at(-1)] = valor;
  }

  const form = $('#fe');
  $('#tipos').onclick = (ev) => {
    const b = ev.target.closest('[data-tipo]');
    if (!b || b.disabled) return;
    F.tipo = Number(b.dataset.tipo);
    if (F.tipo === 7) F.moneda = 'PYG';
    renderTodo();
  };

  form.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.f) {
      F.items[Number(t.closest('tr').dataset.i)][t.dataset.f] = t.value;
      t.removeAttribute('aria-invalid');
      return recalcular();
    }
    if (t.name === 'observacion') F.observacion = t.value;
    const k = t.dataset.k;
    if (!k) return;
    const v = t.type === 'checkbox' ? t.checked : t.value;
    if (k === 'moneda') {
      F.moneda = v;
      F.tipoCambio = v === 'PYG' ? '' : String(S.cot.monedas[v]?.valor ?? '');
      renderMoneda();
      return renderItems();
    }
    if (k === 'porItem') {
      F.porItem = v;
      renderMoneda();
      return renderItems();
    }
    if (k === 'tipoCambio') F.tipoCambio = v;
    else if (k === 'tipoTransaccion') F.tipoTransaccion = Number(v);
    else if (k === 'cliente') F.cliente = v;
    else if (k === 'asociado') F.asociado = v.replace(/\D/g, '');
    else if (k === 'asociadoSel') {
      F.asociado = v;
      $('[data-k="asociado"]').value = v;
    } else if (k === 'motivo') F.motivo = Number(v);
    else if (k.startsWith('cond.')) {
      F.condicion[k.slice(5)] = v;
      if (k === 'cond.tipo') renderMoneda();
    } else if (k.startsWith('r.')) setRuta(F.remision, k.slice(2), v);
    else if (k.startsWith('afc.')) F.autofactura.constancia[k.slice(4)] = v;
    else if (k.startsWith('af.')) F.autofactura.vendedor[k.slice(3)] = v;
    recalcular();
  });
  form.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-quitar]');
    if (q) {
      F.items.splice(Number(q.dataset.quitar), 1);
      renderItems();
    }
  });
  $('#addItem').onclick = () => {
    F.items.push(itemVacio());
    renderItems();
    $(`#tablaItems tr[data-i="${F.items.length - 1}"] [data-f="descripcion"]`)?.focus();
  };
  $('#buscarProd').addEventListener('change', (ev) => {
    const codigo = ev.target.value.split(' · ')[0];
    const p = productos.find((x) => x.codigo === codigo);
    if (!p) return;
    // Conversión entre monedas pasando por guaraníes.
    let precio = p.precio;
    if (p.moneda !== F.moneda) {
      const origen = tasa(p.moneda);
      const destino = F.moneda === 'PYG' ? 1 : num(F.tipoCambio) || tasa(F.moneda);
      if (!origen || !destino) {
        toast(`Falta la cotización para convertir de ${p.moneda} a ${F.moneda}`, 'err');
      } else {
        const d = decimales(F.moneda);
        precio = Math.round(((p.precio * origen) / destino) * 10 ** d) / 10 ** d;
        toast(`Precio convertido de ${fmt(p.precio, p.moneda, true)} a ${fmt(precio, F.moneda, true)}`);
      }
    }
    const nuevo = { codigo: p.codigo, descripcion: p.descripcion, cantidad: 1, precioUnitario: precio, descuento: 0, iva: p.iva, tipoCambio: '' };
    const vacio = F.items.findIndex((it) => !it.descripcion && !Number(it.precioUnitario));
    if (vacio >= 0) F.items[vacio] = nuevo;
    else F.items.push(nuevo);
    ev.target.value = '';
    renderItems();
  });

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    $('#errEmitir').innerHTML = '';
    const faltante = $$('input[required], select[required]', form).find((i) => !i.disabled && !i.value.trim());
    if (faltante) {
      faltante.setAttribute('aria-invalid', 'true');
      faltante.focus();
      return toast('Completá los campos obligatorios', 'err');
    }
    const c = cuerpoCalculo();
    const cuerpo = {
      ...c, tipoTransaccion: F.tipoTransaccion, observacion: F.observacion || undefined,
      cliente: F.cliente === 'innominado' ? { innominado: true } : F.cliente ? { id: Number(F.cliente) } : null,
      condicion: { ...F.condicion, tipo: Number(F.condicion.tipo), pagoTipo: Number(F.condicion.pagoTipo) },
      asociado: F.tipo === 5 || F.tipo === 6 ? { cdc: F.asociado } : undefined, motivo: F.motivo,
      remision: F.tipo === 7 ? { ...F.remision, motivo: Number(F.remision.motivo), responsable: Number(F.remision.responsable) } : undefined,
      autofactura: F.tipo === 4 ? F.autofactura : undefined,
    };
    try {
      const doc = await conCarga(ev.submitter, () => api('POST', '/api/documentos', cuerpo));
      if (doc.estado === 'aprobado') toast(`${S.cat.tipos[doc.tipo].corto} ${nroDoc(e, doc)} aprobada`);
      else toast(`Documento ${doc.estado}: ${doc.respuesta?.mensaje || ''}`, doc.estado === 'rechazado' ? 'err' : '');
      location.hash = `#/documentos/${doc.id}`;
    } catch (err) {
      $('#errEmitir').innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
    }
  };

  if (F.moneda !== 'PYG' && !F.tipoCambio) F.tipoCambio = String(S.cot.monedas[F.moneda]?.valor ?? '');
  renderTodo();
}

// ---------- Documentos ----------
async function vistaDocumentos(params) {
  layout('documentos', '<p class="muted">Cargando…</p>');
  const filtros = Object.fromEntries(params);
  const qs = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
  const docs = await api('GET', `/api/documentos${qs ? '?' + qs : ''}`);
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Historial', 'Documentos', 'Facturas, notas y autofacturas emitidas.', `<a class="btn primary" href="#/emitir">${icon('plus')} Emitir</a>`)}
    <form class="card row" id="filtros" role="search" style="margin-bottom:16px">
      <label class="f" style="flex:2;min-width:200px">Buscar <input name="q" value="${esc(filtros.q)}" placeholder="Cliente, número o CDC"></label>
      <label class="f" style="flex:1;min-width:150px">Tipo <select name="tipo"><option value="">Todos</option>${Object.entries(S.cat.tipos).map(([k, t]) => `<option value="${k}" ${filtros.tipo == k ? 'selected' : ''}>${esc(t.corto)}</option>`).join('')}</select></label>
      <label class="f" style="flex:1;min-width:140px">Estado <select name="estado"><option value="">Todos</option>${['aprobado', 'pendiente', 'rechazado', 'cancelado'].map((s) => `<option ${filtros.estado === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
      <label class="f" style="flex:1;min-width:120px">Moneda <select name="moneda"><option value="">Todas</option>${Object.keys(S.cat.monedas).map((m) => `<option ${filtros.moneda === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <button class="btn" style="align-self:flex-end">${icon('search')} Filtrar</button>
    </form>
    <div class="card">${tablaDocs(docs)}</div>`;
  $('#filtros').onsubmit = (ev) => {
    ev.preventDefault();
    const q = new URLSearchParams(Object.entries(datosForm(ev.target)).filter(([, v]) => v));
    location.hash = `#/documentos${q.toString() ? '?' + q : ''}`;
  };
  enlazarTablaDocs();
}

async function vistaDocumento(id) {
  layout('documentos', '<p class="muted">Cargando…</p>');
  const d = await api('GET', `/api/documentos/${id}`);
  const e = S.sesion.empresa;
  const t = d.datos.totales;
  const r = d.respuesta || {};
  const plan = S.cat.planes[e.plan];
  const esFactura = d.tipo === 1 || d.tipo === 4;
  document.getElementById('contenido').innerHTML = `
    ${cabecera(S.cat.tipos[d.tipo].nombre, `${nroDoc(e, d)} ${badge(d.estado)}`, `Emitido el ${fecha(d.fecha)} · ${esc(d.cliente || '')}`,
      `<a class="btn" href="#/documentos">${icon('arrow')} Volver</a>`)}
    <div class="grid g3">
      <div class="card kpi"><div class="lbl">Total</div><div class="val">${d.tipo === 7 ? '—' : fmt(d.total, d.moneda, true)}</div>
        ${d.moneda !== 'PYG' ? `<div class="sub">Gs. ${fmt(d.totalGs)} · T.C. ${t.tipoCambio ? fmtNum(t.tipoCambio) : 'por ítem'}</div>` : ''}</div>
      <div class="card kpi"><div class="lbl">IVA</div><div class="val">${d.tipo === 7 || d.tipo === 4 ? '—' : fmt(t.totalIva, d.moneda, true)}</div>
        ${d.tipo !== 7 && d.tipo !== 4 ? `<div class="sub">10%: ${fmt(t.iva10, d.moneda)} · 5%: ${fmt(t.iva5, d.moneda)}</div>` : ''}</div>
      <div class="card kpi"><div class="lbl">Respuesta SIFEN</div><div class="val" style="font-size:1.1rem">${esc(r.estado || '—')}</div>
        <div class="sub">${esc([r.codigo, r.mensaje].filter(Boolean).join(' · '))}${r.protocolo ? `<br>Protocolo ${esc(r.protocolo)}` : ''}</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="eyebrow">Código de control (CDC)</div>
      <div class="mono" style="font-size:1.05rem;word-break:break-all;font-weight:500">${d.cdc.match(/.{1,4}/g).join(' ')}</div>
      <div class="row" style="margin-top:16px">
        <a class="btn primary" href="/api/documentos/${d.id}/kude" target="_blank" rel="noopener">${icon('print')} Ver KuDE / imprimir</a>
        <a class="btn" href="/api/documentos/${d.id}/xml">${icon('download')} Descargar XML</a>
        <button class="btn" id="bEmail">${icon('mail')} Enviar por email</button>
        <button class="btn" id="bConsultar">${icon('refresh')} Consultar en SIFEN</button>
        ${d.estado === 'pendiente' ? `<button class="btn" id="bReenviar">${icon('zap')} Reenviar</button>` : ''}
        ${d.estado === 'aprobado' && esFactura && plan.tipos.includes(5) ? `<a class="btn" href="#/emitir?desde=${d.id}&tipo=5">Emitir nota de crédito</a>` : ''}
        ${d.estado === 'aprobado' && esFactura && plan.tipos.includes(6) ? `<a class="btn" href="#/emitir?desde=${d.id}&tipo=6">Emitir nota de débito</a>` : ''}
        ${d.estado === 'aprobado' ? `<button class="btn danger" id="bCancelar">${icon('x')} Cancelar</button>` : ''}
      </div>
    </div>
    <div class="card"><h2>Ítems</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Descripción</th><th class="num">Cant.</th>${d.tipo !== 7 ? '<th class="num">Precio</th><th>IVA</th><th class="num">Total</th>' : ''}</tr></thead><tbody>
      ${d.datos.items.map((it) => `<tr><td>${esc(it.descripcion)}</td><td class="num">${fmtNum(it.cantidad, 4)}</td>${d.tipo !== 7 ? `<td class="num">${fmt(it.precioUnitario, d.moneda)}</td><td>${d.tipo === 4 ? '—' : it.iva ? it.iva + '%' : 'Exento'}</td><td class="num">${fmt(it.totalOperacion, d.moneda)}</td>` : ''}</tr>`).join('')}
    </tbody></table></div></div>
    ${r.cancelacion ? `<div class="card"><h2>Cancelación</h2><p style="margin:0">${esc(r.cancelacion.motivo)} · ${esc(r.cancelacion.mensaje || r.cancelacion.estado)}</p></div>` : ''}
    <dialog id="dlg"></dialog>`;

  const dlg = $('#dlg');
  const abrir = (html, alEnviar) => {
    dlg.innerHTML = `<form method="dialog" class="dlg">${html}<div id="dErr" role="alert"></div><div class="acciones"><button class="btn" value="cancel" formnovalidate>Cerrar</button><button class="btn primary" value="ok">Confirmar</button></div></form>`;
    const f = $('form', dlg);
    f.onsubmit = async (ev) => {
      if (ev.submitter?.value !== 'ok') return;
      ev.preventDefault();
      try {
        await conCarga(ev.submitter, () => alEnviar(datosForm(f)));
        dlg.close();
      } catch (err) {
        $('#dErr', dlg).innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
      }
    };
    dlg.showModal();
  };

  $('#bEmail').onclick = () =>
    abrir(`<h2>Enviar por email</h2><p class="muted" style="margin:0">Se adjuntan el XML y el KuDE.</p><label class="f">Email del cliente <input name="email" type="email" required></label>`, async (v) => {
      await api('POST', `/api/documentos/${d.id}/email`, v);
      toast('Email enviado');
    });
  $('#bConsultar').onclick = async (ev) => {
    try {
      const c = await conCarga(ev.currentTarget, () => api('GET', `/api/documentos/${d.id}/consulta`));
      toast(`SIFEN: ${c.estado || ''} ${c.mensaje || ''}`);
    } catch (err) {
      toast(err.message, 'err');
    }
  };
  $('#bReenviar')?.addEventListener('click', async (ev) => {
    try {
      await conCarga(ev.currentTarget, () => api('POST', `/api/documentos/${d.id}/reenviar`));
      vistaDocumento(id);
    } catch (err) {
      toast(err.message, 'err');
    }
  });
  $('#bCancelar')?.addEventListener('click', () =>
    abrir(`<h2>Cancelar documento</h2><p class="muted" style="margin:0">El SIFEN admite la cancelación dentro de las 48 horas de aprobado. Después corresponde una nota de crédito.</p>
      <label class="f">Motivo <textarea name="motivo" required minlength="5"></textarea></label>`, async (v) => {
      await api('POST', `/api/documentos/${d.id}/cancelar`, v);
      toast('Documento cancelado');
      vistaDocumento(id);
    }),
  );
}

// ---------- Clientes ----------
async function vistaClientes(params) {
  layout('clientes', '<p class="muted">Cargando…</p>');
  const lista = await api('GET', '/api/clientes');
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Agenda', 'Clientes', 'Contribuyentes con RUC y no contribuyentes (cédula, pasaporte, extranjeros).', `<button class="btn primary" id="nuevo">${icon('plus')} Nuevo cliente</button>`)}
    <div class="card">${lista.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Identificación</th><th>Email</th><th>País</th><th></th></tr></thead><tbody>
      ${lista.map((c) => `<tr><td>${esc(c.nombre)}</td><td class="mono">${c.contribuyente ? `RUC ${esc(c.ruc)}-${c.dv}` : `${esc(S.cat.tiposId[c.tipo_doc] || '')} ${esc(c.num_doc)}`}</td><td>${esc(c.email || '')}</td><td>${esc(c.pais)}</td>
      <td class="num"><button class="btn sm ghost" data-ed="${c.id}" aria-label="Editar ${esc(c.nombre)}">${icon('edit')}</button><button class="btn sm ghost danger" data-del="${c.id}" aria-label="Eliminar ${esc(c.nombre)}">${icon('trash')}</button></td></tr>`).join('')}
    </tbody></table></div>` : `<div class="empty">${icon('users')}<div>Todavía no cargaste clientes.</div></div>`}</div>
    <dialog id="dlg"></dialog>`;

  const dlg = $('#dlg');
  const abrir = (c = { contribuyente: 1, pais: 'PRY', pais_desc: 'Paraguay', tipo_doc: 1 }) => {
    dlg.innerHTML = `<form class="dlg" novalidate><h2>${c.id ? 'Editar' : 'Nuevo'} cliente</h2>
      <div class="seg" role="radiogroup" aria-label="Tipo de cliente">
        <button type="button" data-c="1" aria-pressed="${!!c.contribuyente}">Contribuyente (RUC)</button>
        <button type="button" data-c="0" aria-pressed="${!c.contribuyente}">No contribuyente</button></div>
      <input type="hidden" name="contribuyente" value="${c.contribuyente ? 1 : 0}">
      <label class="f">Nombre o razón social <input name="nombre" required value="${esc(c.nombre)}"></label>
      <div class="grid g2" data-ruc ${c.contribuyente ? '' : 'hidden'}>
        <label class="f">RUC <span class="help">Con o sin DV, ej. 80012345-0</span><input name="ruc" value="${c.ruc ? `${esc(c.ruc)}-${c.dv}` : ''}"></label>
        <label class="f">Tipo <select name="tipoContribuyente"><option value="1">Persona física</option><option value="2" ${c.tipo_contribuyente == 2 ? 'selected' : ''}>Persona jurídica</option></select></label></div>
      <div class="grid g2" data-doc ${c.contribuyente ? 'hidden' : ''}>
        <label class="f">Tipo de documento <select name="tipoDoc">${[1, 2, 3, 4, 6, 9].map((t) => `<option value="${t}" ${c.tipo_doc == t ? 'selected' : ''}>${S.cat.tiposId[t]}</option>`).join('')}</select></label>
        <label class="f">Número <input name="numDoc" value="${esc(c.num_doc)}"></label></div>
      <div class="grid g2">
        <label class="f">Email <input name="email" type="email" value="${esc(c.email)}"></label>
        <label class="f">Teléfono <input name="telefono" value="${esc(c.telefono)}"></label>
        <label class="f">País (código ISO-3) <input name="pais" maxlength="3" value="${esc(c.pais)}"></label>
        <label class="f">País (nombre) <input name="paisDesc" value="${esc(c.pais_desc)}"></label></div>
      <label class="f">Dirección <span class="help">Opcional</span><input name="direccion" value="${esc(c.direccion)}"></label>
      <div id="dErr" role="alert"></div>
      <div class="acciones"><button type="button" class="btn" id="cerrar">Cancelar</button><button class="btn primary">Guardar</button></div></form>`;
    const f = $('form', dlg);
    $('.seg', f).onclick = (ev) => {
      const b = ev.target.closest('[data-c]');
      if (!b) return;
      const contrib = b.dataset.c === '1';
      f.elements.contribuyente.value = contrib ? 1 : 0;
      $$('.seg button', f).forEach((x) => x.setAttribute('aria-pressed', x === b));
      $('[data-ruc]', f).hidden = !contrib;
      $('[data-doc]', f).hidden = contrib;
    };
    $('#cerrar', f).onclick = () => dlg.close();
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      const v = datosForm(f);
      v.contribuyente = v.contribuyente === '1';
      try {
        await conCarga(ev.submitter, () => api(c.id ? 'PUT' : 'POST', `/api/clientes${c.id ? '/' + c.id : ''}`, v));
        dlg.close();
        toast('Cliente guardado');
        vistaClientes(new URLSearchParams());
      } catch (err) {
        $('#dErr', f).innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
      }
    };
    dlg.showModal();
  };
  $('#nuevo').onclick = () => abrir();
  $$('[data-ed]').forEach((b) => (b.onclick = () => abrir(lista.find((c) => c.id == b.dataset.ed))));
  $$('[data-del]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api('DELETE', `/api/clientes/${b.dataset.del}`);
    vistaClientes(new URLSearchParams());
  }));
  if (params.get('nuevo')) abrir();
}

// ---------- Productos ----------
async function vistaProductos() {
  layout('productos', '<p class="muted">Cargando…</p>');
  const lista = await api('GET', '/api/productos');
  const plan = S.cat.planes[S.sesion.empresa.plan];
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Catálogo', 'Productos y servicios', `${lista.length} de ${plan.productos} incluidos en su plan. Cada producto tiene su moneda: al facturar en otra, el precio se convierte con la cotización.`, `<button class="btn primary" id="nuevo">${icon('plus')} Nuevo producto</button>`)}
    <div class="card">${lista.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Código</th><th>Descripción</th><th class="num">Precio (IVA incl.)</th><th>IVA</th><th></th></tr></thead><tbody>
      ${lista.map((p) => `<tr><td class="mono">${esc(p.codigo)}</td><td>${esc(p.descripcion)}</td><td class="num">${fmt(p.precio, p.moneda, true)}</td><td>${p.iva ? p.iva + '%' : 'Exento'}</td>
      <td class="num"><button class="btn sm ghost" data-ed="${p.id}" aria-label="Editar ${esc(p.descripcion)}">${icon('edit')}</button><button class="btn sm ghost danger" data-del="${p.id}" aria-label="Eliminar ${esc(p.descripcion)}">${icon('trash')}</button></td></tr>`).join('')}
    </tbody></table></div>` : `<div class="empty">${icon('box')}<div>Cargá tus productos para facturar más rápido.</div></div>`}</div>
    <dialog id="dlg"></dialog>`;
  const dlg = $('#dlg');
  const abrir = (p = { moneda: 'PYG', iva: 10 }) => {
    dlg.innerHTML = `<form class="dlg" novalidate><h2>${p.id ? 'Editar' : 'Nuevo'} producto</h2>
      <div class="grid g2"><label class="f">Código <input name="codigo" required value="${esc(p.codigo)}"></label>
      <label class="f">IVA <select name="iva">${[10, 5, 0].map((t) => `<option value="${t}" ${p.iva == t ? 'selected' : ''}>${t ? t + '%' : 'Exento'}</option>`).join('')}</select></label></div>
      <label class="f">Descripción <input name="descripcion" required value="${esc(p.descripcion)}"></label>
      <div class="grid g2"><label class="f">Precio (IVA incluido) <input name="precio" inputmode="decimal" value="${esc(p.precio ?? '')}"></label>
      <label class="f">Moneda <select name="moneda">${Object.keys(S.cat.monedas).map((m) => `<option ${p.moneda === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></div>
      <div id="dErr" role="alert"></div>
      <div class="acciones"><button type="button" class="btn" id="cerrar">Cancelar</button><button class="btn primary">Guardar</button></div></form>`;
    const f = $('form', dlg);
    $('#cerrar', f).onclick = () => dlg.close();
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      const v = datosForm(f);
      v.precio = Number(String(v.precio).replace(',', '.'));
      try {
        await conCarga(ev.submitter, () => api(p.id ? 'PUT' : 'POST', `/api/productos${p.id ? '/' + p.id : ''}`, v));
        dlg.close();
        vistaProductos();
      } catch (err) {
        $('#dErr', f).innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
      }
    };
    dlg.showModal();
  };
  $('#nuevo').onclick = () => abrir();
  $$('[data-ed]').forEach((b) => (b.onclick = () => abrir(lista.find((p) => p.id == b.dataset.ed))));
  $$('[data-del]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api('DELETE', `/api/productos/${b.dataset.del}`);
    vistaProductos();
  }));
}

// ---------- Cotizaciones ----------
async function vistaCotizaciones() {
  layout('cotizaciones', '<p class="muted">Cargando…</p>');
  const c = await api('GET', '/api/cotizaciones');
  const monedas = Object.keys(S.cat.monedas).filter((m) => m !== 'PYG');
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Multidivisa', 'Cotizaciones', 'Guaraníes por unidad de moneda extranjera. Fijá la cotización que usa tu empresa (por ejemplo la referencial del BCP del día); si no, se usa la de referencia automática.')}
    ${c.error ? `<div class="alert warn" style="margin-bottom:16px">No se pudo obtener la cotización automática (${esc(c.error)}). Cargala manualmente.</div>` : ''}
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Moneda</th><th class="num">Gs. por unidad</th><th>Fuente</th><th>Actualizado</th><th style="min-width:260px">Fijar cotización propia</th></tr></thead><tbody>
      ${monedas.map((m) => {
        const x = c.monedas[m];
        return `<tr><td><span class="chip">${m}</span> ${esc(S.cat.monedas[m].nombre)}</td><td class="num">${x ? fmtNum(x.valor) : '—'}</td>
        <td>${x ? (x.fuente === 'manual' ? '<span class="badge b-aprobado">Manual</span>' : esc(x.fuente)) : '—'}</td><td class="small muted">${x ? fecha(x.actualizado) : ''}</td>
        <td><form class="row" data-m="${m}"><label class="sr" for="c-${m}">Cotización ${m}</label><input id="c-${m}" name="valor" inputmode="decimal" style="width:130px" placeholder="${x ? x.valor : ''}">
          <button class="btn sm">Guardar</button>${x?.fuente === 'manual' ? `<button type="button" class="btn sm ghost" data-borrar="${m}">Usar automática</button>` : ''}</form></td></tr>`;
      }).join('')}
    </tbody></table></div></div>`;
  $$('form[data-m]').forEach((f) => (f.onsubmit = async (ev) => {
    ev.preventDefault();
    try {
      await api('PUT', `/api/cotizaciones/${f.dataset.m}`, { valor: Number(String(f.elements.valor.value).replace(',', '.')) });
      toast(`Cotización ${f.dataset.m} guardada`);
      vistaCotizaciones();
    } catch (err) {
      toast(err.message, 'err');
    }
  }));
  $$('[data-borrar]').forEach((b) => (b.onclick = async () => {
    await api('DELETE', `/api/cotizaciones/${b.dataset.borrar}`);
    vistaCotizaciones();
  }));
}

// ---------- Planes ----------
function vistaPlanes() {
  const e = S.sesion.empresa;
  layout('planes', `
    ${cabecera('Inversión · planes en guaraníes', 'Plan y facturación', 'Abono mensual con tarjeta, sin permanencia. Subí o bajá de plan cuando quieras, sin penalización.')}
    <div class="grid g3" id="planes">${tarjetasPlanes(e.plan, false)}</div>
    <div class="card" style="margin-top:16px"><div class="eyebrow">Configuración inicial · opcional</div>
      <h2>Setup completo por nuestros informáticos · Gs. ${fmt(S.cat.setup.precio)} <span class="muted small">pago único</span></h2>
      <p class="muted" style="margin:0">${esc(S.cat.setup.descripcion)} <a href="#/soporte">Solicitarlo por ticket</a>.</p></div>`);
  $('#planes').onclick = async (ev) => {
    const b = ev.target.closest('[data-plan]');
    if (!b || b.dataset.plan === e.plan) return;
    if (!confirm(`¿Cambiar al plan ${S.cat.planes[b.dataset.plan].nombre}?`)) return;
    await api('PUT', '/api/empresa/plan', { plan: b.dataset.plan });
    await cargarSesion();
    toast('Plan actualizado');
    vistaPlanes();
  };
}

// ---------- Soporte ----------
async function vistaSoporte() {
  layout('soporte', '<p class="muted">Cargando…</p>');
  const tickets = await api('GET', '/api/tickets');
  document.getElementById('contenido').innerHTML = `
    ${cabecera('Soporte directo', 'Tickets', 'Resolvé incidencias de forma trazable.')}
    <div class="grid g2">
      <form class="card grid" id="nuevo"><h2 style="margin:0">Nuevo ticket</h2>
        <label class="f">Asunto <input name="asunto" required maxlength="120"></label>
        <label class="f">Mensaje <textarea name="mensaje" required></textarea></label>
        <button class="btn primary">Enviar</button></form>
      <div class="card"><h2>Mis tickets</h2>${tickets.length ? tickets.map((t) => `<details style="border-bottom:1px solid var(--border);padding:10px 0">
        <summary style="cursor:pointer;min-height:32px"><strong>#${t.id} ${esc(t.asunto)}</strong> <span class="badge ${t.estado === 'abierto' ? 'b-pendiente' : 'b-cancelado'}">${t.estado}</span></summary>
        ${t.mensajes.map((m) => `<p style="margin:8px 0"><span class="small muted">${esc(m.autor)} · ${fecha(m.fecha)}</span><br>${esc(m.texto)}</p>`).join('')}
        ${t.estado === 'abierto' ? `<form class="row" data-t="${t.id}"><label class="sr" for="r-${t.id}">Responder</label><input id="r-${t.id}" name="mensaje" placeholder="Responder…" style="flex:1"><button class="btn sm">Enviar</button><button type="button" class="btn sm ghost" data-cerrar="${t.id}">Cerrar ticket</button></form>` : ''}
      </details>`).join('') : '<p class="muted">Sin tickets.</p>'}</div>
    </div>`;
  $('#nuevo').onsubmit = async (ev) => {
    ev.preventDefault();
    try {
      await api('POST', '/api/tickets', datosForm(ev.target));
      toast('Ticket creado');
      vistaSoporte();
    } catch (err) {
      toast(err.message, 'err');
    }
  };
  $$('form[data-t]').forEach((f) => (f.onsubmit = async (ev) => {
    ev.preventDefault();
    await api('POST', `/api/tickets/${f.dataset.t}/mensajes`, datosForm(f));
    vistaSoporte();
  }));
  $$('[data-cerrar]').forEach((b) => (b.onclick = async () => {
    await api('POST', `/api/tickets/${b.dataset.cerrar}/mensajes`, { mensaje: 'Ticket cerrado por el usuario', cerrar: true });
    vistaSoporte();
  }));
}

// ---------- Configuración ----------
function vistaConfiguracion() {
  const e = S.sesion.empresa;
  const cert = e.certificado;
  layout('configuracion', `
    ${cabecera('Empresa y SIFEN', 'Configuración', 'Datos del emisor, timbrado, certificado digital y ambiente de transmisión.')}
    <form class="card" id="fEmp" novalidate>
      <h2>Datos del emisor</h2>${camposEmpresa(e)}
      <h3 style="margin:22px 0 12px">Conexión con el SIFEN</h3>
      <div class="grid g3">
        <label class="f">Ambiente <select name="ambiente">${Object.entries(AMBIENTES).map(([k, t]) => `<option value="${k}" ${e.ambiente === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <span class="help">Simulado: no transmite. Test: ambiente de pruebas de la DNIT. Producción: validez fiscal.</span></label>
        <label class="f">ID del CSC <input name="idCSC" maxlength="4" value="${esc(e.idCSC || '0001')}"></label>
        <label class="f">CSC (código de seguridad del contribuyente) <input name="csc" type="password" autocomplete="off" placeholder="${e.cscCargado ? '•••••••• (cargado)' : 'Pegá el CSC entregado por la DNIT'}"></label>
      </div>
      <div id="eErr" role="alert" style="margin-top:12px"></div>
      <div class="row" style="margin-top:16px"><span class="spacer"></span><button class="btn primary">Guardar cambios</button></div>
    </form>
    <form class="card" id="fCert" novalidate>
      <h2>Certificado digital</h2>
      ${cert ? `<div class="alert ${cert.prueba ? 'warn' : 'ok'}" style="margin-bottom:14px">${cert.prueba ? 'Certificado de prueba autogenerado (solo válido en modo simulado).' : `Certificado de ${esc(cert.titular)}`} · Vence ${esc(cert.validoHasta?.slice(0, 10))}</div>` : '<p class="muted">Todavía no hay certificado cargado.</p>'}
      <div class="grid g2">
        <label class="f">Archivo .p12 / .pfx <input name="archivo" type="file" accept=".p12,.pfx,application/x-pkcs12" required></label>
        <label class="f">Contraseña del certificado <input name="password" type="password" autocomplete="off"></label>
      </div>
      <p class="small muted">La contraseña se guarda cifrada (AES-256-GCM). El certificado se usa para firmar cada documento y para la conexión TLS con el SIFEN.</p>
      <div id="cErr" role="alert"></div>
      <div class="row"><span class="spacer"></span><button class="btn primary">Cargar certificado</button></div>
    </form>`);
  enlazarDV($('#fEmp'));
  $('#fEmp').onsubmit = async (ev) => {
    ev.preventDefault();
    try {
      await conCarga(ev.submitter, () => api('PUT', '/api/empresa', datosForm(ev.target)));
      await cargarSesion();
      toast('Configuración guardada');
      vistaConfiguracion();
    } catch (err) {
      $('#eErr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
    }
  };
  $('#fCert').onsubmit = async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const archivo = f.elements.archivo.files[0];
    if (!archivo) return ($('#cErr').innerHTML = '<div class="alert err">Seleccioná el archivo</div>');
    const b64 = await new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result).split(',')[1]);
      r.readAsDataURL(archivo);
    });
    try {
      const r = await conCarga(ev.submitter, () => api('PUT', '/api/empresa/certificado', { archivo: b64, password: f.elements.password.value }));
      await cargarSesion();
      toast(`Certificado de ${r.titular} cargado`);
      vistaConfiguracion();
    } catch (err) {
      $('#cErr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`;
    }
  };
}

// ---------- Router ----------
async function cargarSesion() {
  try {
    S.sesion = await api('GET', '/api/sesion');
  } catch {
    S.sesion = null;
  }
}

async function render() {
  const [ruta, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(qs || '');
  const [vista, id] = ruta.split('/');
  if (!S.sesion && !['login', 'registro'].includes(vista)) return (location.hash = '#/login');
  if (S.sesion && ['login', 'registro', ''].includes(vista)) return (location.hash = '#/panel');
  window.scrollTo(0, 0);
  try {
    switch (vista) {
      case 'login': return vistaLogin();
      case 'registro': return vistaRegistro();
      case 'panel': return await vistaPanel();
      case 'emitir': return await vistaEmitir(params);
      case 'documentos': return id ? await vistaDocumento(id) : await vistaDocumentos(params);
      case 'clientes': return await vistaClientes(params);
      case 'productos': return await vistaProductos();
      case 'cotizaciones': return await vistaCotizaciones();
      case 'planes': return vistaPlanes();
      case 'soporte': return await vistaSoporte();
      case 'configuracion': return vistaConfiguracion();
      default: location.hash = '#/panel';
    }
  } catch (err) {
    if (err.status !== 401) toast(err.message, 'err');
  }
}

(async function iniciar() {
  S.cat = await api('GET', '/api/catalogos');
  await cargarSesion();
  window.addEventListener('hashchange', render);
  render();
})();
