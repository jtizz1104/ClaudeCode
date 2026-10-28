// Catálogos del Manual Técnico SIFEN v150 que usa la app.
// Las descripciones van tal cual las espera el SIFEN en los campos dDes*.

export const VERSION = '150';

export const TIPOS_DE = {
  1: { nombre: 'Factura electrónica', corto: 'Factura' },
  4: { nombre: 'Autofactura electrónica', corto: 'Autofactura' },
  5: { nombre: 'Nota de crédito electrónica', corto: 'Nota de crédito' },
  6: { nombre: 'Nota de débito electrónica', corto: 'Nota de débito' },
  7: { nombre: 'Nota de remisión electrónica', corto: 'Nota de remisión' },
};

// Monedas habilitadas en la interfaz. SIFEN acepta cualquier código ISO 4217;
// la descripción es la que publica la tabla de monedas del manual.
export const MONEDAS = {
  PYG: { nombre: 'Guarani', simbolo: 'Gs.', decimales: 0 },
  USD: { nombre: 'US Dollar', simbolo: 'US$', decimales: 2 },
  EUR: { nombre: 'Euro', simbolo: '€', decimales: 2 },
  BRL: { nombre: 'Brazilian Real', simbolo: 'R$', decimales: 2 },
  ARS: { nombre: 'Argentine Peso', simbolo: 'AR$', decimales: 2 },
  CLP: { nombre: 'Chilean Peso', simbolo: 'CLP$', decimales: 0 },
  UYU: { nombre: 'Peso Uruguayo', simbolo: '$U', decimales: 2 },
  GBP: { nombre: 'Pound Sterling', simbolo: '£', decimales: 2 },
  JPY: { nombre: 'Yen', simbolo: '¥', decimales: 0 },
  CNY: { nombre: 'Yuan Renminbi', simbolo: 'CN¥', decimales: 2 },
};

export const TIPOS_TRANSACCION = {
  1: 'Venta de mercadería',
  2: 'Prestación de servicios',
  3: 'Mixto (Venta de mercadería y servicios)',
};

export const AFECTACION_IVA = {
  1: 'Gravado IVA',
  2: 'Exonerado (Art. 100 - Ley 6380/2019)',
  3: 'Exento',
  4: 'Gravado parcial (Grav-Exento)',
};

export const TIPOS_ID = {
  1: 'Cédula paraguaya',
  2: 'Pasaporte',
  3: 'Cédula extranjera',
  4: 'Carnet de residencia',
  5: 'Innominado',
  6: 'Tarjeta Diplomática de exoneración fiscal',
  9: 'Otro',
};

export const TIPOS_OPERACION = { 1: 'B2B', 2: 'B2C', 3: 'B2G', 4: 'B2F' };

export const CONDICION_OPERACION = { 1: 'Contado', 2: 'Crédito' };

export const TIPOS_PAGO = {
  1: 'Efectivo',
  5: 'Transferencia',
};

export const MOTIVOS_NC_ND = {
  1: 'Devolución y Ajuste de precios',
  2: 'Devolución',
  3: 'Descuento',
  4: 'Bonificación',
  5: 'Crédito incobrable',
  6: 'Recupero de costo',
  7: 'Recupero de gasto',
  8: 'Ajuste de precio',
};

export const MOTIVOS_REMISION = {
  1: 'Traslado por venta',
  2: 'Traslado por consignación',
  3: 'Exportación',
  4: 'Traslado por compra',
  5: 'Importación',
  6: 'Traslado por devolución',
  7: 'Traslado entre locales de la empresa',
  8: 'Traslado de bienes por transformación',
  9: 'Traslado de bienes por reparación',
  10: 'Traslado por emisor móvil',
  11: 'Exhibición o demostración',
  12: 'Participación en ferias',
  13: 'Traslado de encomienda',
  14: 'Decomiso',
  99: 'Otro',
};

export const RESPONSABLES_REMISION = {
  1: 'Emisor de la factura',
  2: 'Poseedor de la factura y bienes',
  3: 'Empresa transportista',
  4: 'Despachante de Aduanas',
  5: 'Agente de transporte o intermediario',
};

export const UNIDAD_DEFECTO = { codigo: 77, descripcion: 'UNI' };

export const URLS = {
  test: {
    recibe: 'https://sifen-test.set.gov.py/de/ws/sync/recibe.wsdl',
    consulta: 'https://sifen-test.set.gov.py/de/ws/consultas/consulta.wsdl',
    evento: 'https://sifen-test.set.gov.py/de/ws/eventos/evento.wsdl',
    qr: 'https://ekuatia.set.gov.py/consultas-test/qr?',
  },
  prod: {
    recibe: 'https://sifen.set.gov.py/de/ws/sync/recibe.wsdl',
    consulta: 'https://sifen.set.gov.py/de/ws/consultas/consulta.wsdl',
    evento: 'https://sifen.set.gov.py/de/ws/eventos/evento.wsdl',
    qr: 'https://ekuatia.set.gov.py/consultas/qr?',
  },
};
