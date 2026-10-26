import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function abrirDB(ruta = process.env.DB_PATH || 'data/timbra.db') {
  if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });
  const db = new DatabaseSync(ruta);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY,
      ruc TEXT NOT NULL, dv INTEGER NOT NULL,
      razon_social TEXT NOT NULL, nombre_fantasia TEXT,
      tipo_contribuyente INTEGER NOT NULL DEFAULT 1,
      direccion TEXT NOT NULL, num_casa TEXT DEFAULT '0',
      dep_cod INTEGER NOT NULL DEFAULT 1, dep_desc TEXT NOT NULL DEFAULT 'CAPITAL',
      ciu_cod INTEGER NOT NULL DEFAULT 1, ciu_desc TEXT NOT NULL DEFAULT 'ASUNCION (DISTRITO)',
      telefono TEXT NOT NULL, email TEXT NOT NULL,
      act_eco_cod TEXT NOT NULL, act_eco_desc TEXT NOT NULL,
      timbrado TEXT NOT NULL, timbrado_inicio TEXT NOT NULL,
      establecimiento TEXT NOT NULL DEFAULT '001', punto_exp TEXT NOT NULL DEFAULT '001',
      ambiente TEXT NOT NULL DEFAULT 'simulado',
      id_csc TEXT DEFAULT '0001', csc TEXT,
      cert_p12 BLOB, cert_pass TEXT, cert_info TEXT,
      plan TEXT NOT NULL DEFAULT 'simple',
      creado TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL, hash TEXT NOT NULL,
      creado TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sesiones (
      token TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      expira INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      contribuyente INTEGER NOT NULL DEFAULT 1,
      ruc TEXT, dv INTEGER, tipo_contribuyente INTEGER DEFAULT 1,
      tipo_doc INTEGER, num_doc TEXT,
      nombre TEXT NOT NULL, direccion TEXT, email TEXT, telefono TEXT,
      pais TEXT NOT NULL DEFAULT 'PRY', pais_desc TEXT NOT NULL DEFAULT 'Paraguay',
      creado TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      codigo TEXT NOT NULL, descripcion TEXT NOT NULL,
      precio REAL NOT NULL DEFAULT 0, moneda TEXT NOT NULL DEFAULT 'PYG',
      iva INTEGER NOT NULL DEFAULT 10,
      creado TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (empresa_id, codigo)
    );

    CREATE TABLE IF NOT EXISTS secuencias (
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      tipo INTEGER NOT NULL, establecimiento TEXT NOT NULL, punto_exp TEXT NOT NULL,
      ultimo INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (empresa_id, tipo, establecimiento, punto_exp)
    );

    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      tipo INTEGER NOT NULL, numero TEXT NOT NULL, cdc TEXT NOT NULL UNIQUE,
      fecha TEXT NOT NULL, moneda TEXT NOT NULL, tipo_cambio REAL,
      cliente_nombre TEXT, total REAL NOT NULL DEFAULT 0, total_gs REAL NOT NULL DEFAULT 0,
      datos TEXT NOT NULL, xml TEXT NOT NULL, qr TEXT,
      estado TEXT NOT NULL, respuesta TEXT,
      creado TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS documentos_empresa ON documentos (empresa_id, creado);

    CREATE TABLE IF NOT EXISTS cotizaciones (
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      moneda TEXT NOT NULL, valor REAL NOT NULL, actualizado TEXT NOT NULL,
      PRIMARY KEY (empresa_id, moneda)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY,
      empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      asunto TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'abierto',
      mensajes TEXT NOT NULL DEFAULT '[]',
      creado TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

// Ejecuta fn dentro de una transacción (node:sqlite no trae helper propio).
export function transaccion(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
