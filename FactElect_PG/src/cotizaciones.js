import { MONEDAS } from './sifen/constants.js';

// Cotizaciones de referencia a guaraníes. La fuente es configurable (RATES_URL,
// formato de open.er-api.com: { rates: { PYG, EUR, ... } } con base USD).
// El emisor puede fijar una cotización propia (por ejemplo la del BCP del día),
// que tiene prioridad sobre la automática.
const URL = process.env.RATES_URL || 'https://open.er-api.com/v6/latest/USD';
const TTL = 60 * 60 * 1000;
let cache = { cuando: 0, valores: null, fuente: null };

async function automaticas() {
  if (cache.valores && Date.now() - cache.cuando < TTL) return cache;
  const res = await fetch(URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Fuente de cotizaciones respondió ${res.status}`);
  const json = await res.json();
  const pyg = json.rates?.PYG;
  if (!pyg) throw new Error('La fuente de cotizaciones no informa PYG');
  const valores = {};
  for (const m of Object.keys(MONEDAS)) {
    if (m !== 'PYG' && json.rates[m]) valores[m] = Math.round((pyg / json.rates[m]) * 100) / 100;
  }
  cache = { cuando: Date.now(), valores, fuente: new globalThis.URL(URL).hostname };
  return cache;
}

export async function cotizaciones(db, empresaId) {
  const propias = Object.fromEntries(
    db.prepare('SELECT moneda, valor, actualizado FROM cotizaciones WHERE empresa_id = ?').all(empresaId)
      .map((r) => [r.moneda, { valor: r.valor, fuente: 'manual', actualizado: r.actualizado }]),
  );
  let auto = {};
  let error = null;
  try {
    const c = await automaticas();
    auto = Object.fromEntries(
      Object.entries(c.valores).map(([m, v]) => [m, { valor: v, fuente: c.fuente, actualizado: new Date(c.cuando).toISOString() }]),
    );
  } catch (e) {
    error = e.message;
  }
  return { monedas: { ...auto, ...propias }, error };
}

export function guardarCotizacion(db, empresaId, moneda, valor) {
  if (!MONEDAS[moneda] || moneda === 'PYG') throw new Error('Moneda inválida');
  if (!(Number(valor) > 0)) throw new Error('Cotización inválida');
  db.prepare(
    `INSERT INTO cotizaciones (empresa_id, moneda, valor, actualizado) VALUES (?, ?, ?, ?)
     ON CONFLICT (empresa_id, moneda) DO UPDATE SET valor = excluded.valor, actualizado = excluded.actualizado`,
  ).run(empresaId, moneda, Number(valor), new Date().toISOString());
}

export function borrarCotizacion(db, empresaId, moneda) {
  db.prepare('DELETE FROM cotizaciones WHERE empresa_id = ? AND moneda = ?').run(empresaId, moneda);
}
