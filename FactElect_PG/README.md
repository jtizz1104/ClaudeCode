# FactElect_PG

Facturación electrónica para Paraguay (SIFEN v150, DNIT), 100% web y multidivisa.
Implementa la propuesta comercial de mayo de 2026: onboarding online, cinco tipos de
documento, emisión en guaraníes, dólares, euros y otras monedas, y los planes Simple,
Estándar y Pro.

## Qué incluye

| Área | Detalle |
|---|---|
| Documentos | Factura (1), Autofactura (4), Nota de crédito (5), Nota de débito (6), Nota de remisión (7) |
| SIFEN | XML del DE según el Manual Técnico v150 con NT13 (bases e IVA), CDC de 44 dígitos con DV módulo 11, firma XMLDSig RSA-SHA256, QR con `cHashQR` y CSC, envío síncrono `siRecepDE`, consulta `siConsDE` y evento de cancelación `siRecepEvento` con TLS mutuo |
| Multidivisa | PYG, USD, EUR, BRL, ARS, CLP, UYU, GBP, JPY, CNY. Tipo de cambio global (`dCondTiCam=1`) o por ítem (`dCondTiCam=2`) y `dTotalGs` calculado. Cotizaciones automáticas con valores propios por empresa (por ejemplo, la referencial del BCP) que tienen prioridad. Al facturar un producto en otra moneda, el precio se convierte |
| KuDE | Representación gráfica imprimible y guardable como PDF, con QR y CDC |
| Gestión | Clientes (contribuyentes y no contribuyentes, extranjeros), catálogo de productos, numeración por tipo/establecimiento/punto de expedición, panel con cupo del plan y facturación por moneda, tickets de soporte |
| Planes | Cupos de documentos y productos por mes, y tipos de documento habilitados según el plan |
| Email | Envío del XML y el KuDE al cliente por la API de Bird (opcional) |

## Ambientes

- **simulado** (por defecto al registrarse): firma con un certificado autogenerado, genera
  CDC y QR, y aprueba localmente. No envía nada a la DNIT. Sirve para probar el circuito
  completo.
- **test**: transmite a `sifen-test.set.gov.py` con el certificado y el CSC de prueba.
- **prod**: transmite a `sifen.set.gov.py`. Los documentos tienen validez fiscal.

Para pasar a test o producción hay que cargar en *Configuración* el certificado `.p12`
emitido por un PSC habilitado y el ID y valor del CSC que entrega la DNIT al habilitarse
como facturador electrónico.

## Ejecutar

Requiere Node.js 22.13 o posterior (usa `node:sqlite`).

```bash
cd FactElect_PG
npm install
npm start            # http://localhost:3000
npm test             # pruebas de SIFEN (cálculo, XML, firma, QR) y de la API completa
```

Variables de entorno (ver `.env.example`):

| Variable | Uso |
|---|---|
| `PORT` | Puerto HTTP (3000) |
| `DB_PATH` | Ruta de la base SQLite (`data/factelect.db`) |
| `APP_SECRET` | Clave para cifrar la contraseña del certificado y el CSC. Si falta, se genera `data/secret.key` |
| `COOKIE_SECURE` | `1` detrás de HTTPS |
| `RATES_URL` | Fuente de cotizaciones con base USD, con el formato de open.er-api.com |
| `BIRD_API_KEY`, `BIRD_FROM`, `BIRD_API_URL` | Envío de documentos por email con Bird |

## Estructura

```
src/
  sifen/      constants, dv (módulo 11), cdc, calc (IVA y multidivisa), xml (DE v150),
              firma (p12 y XMLDSig), qr, soap (recepción, consulta y eventos)
  emision.js  flujo completo: plan y cupo → cálculo → XML → firma → QR → guardado → envío
  kude.js     KuDE en HTML y envío por email
  server.js   API REST (Express 5) y frontend estático
  db.js       esquema SQLite
public/       SPA en JavaScript sin dependencias
test/         node:test
```

## Pendiente antes de producción

- **Homologación.** Hay que validar contra el ambiente de test de la DNIT con un certificado
  real. Desde el entorno de desarrollo no hubo acceso a `sifen-test.set.gov.py`, por lo que
  el envío SOAP está implementado pero no probado contra el servicio real.
- **Catálogos geográficos.** Los departamentos y ciudades se cargan como código y descripción
  libres. Conviene incorporar las tablas completas del SIFEN.
- **Envío por lotes.** Falta el envío asíncrono (`siRecepLoteDE`) para volúmenes altos y los
  eventos del receptor (conformidad, disconformidad, inutilización).
- **Cobro de suscripciones.** Los planes y cupos funcionan, pero el cobro con tarjeta todavía
  no está integrado.
- **node-forge.** Tiene un aviso de seguridad (GHSA-86w9-cpqp-85rv) que afecta a la
  verificación de firmas PKCS#1. La app usa la librería solo para leer el `.p12`.
