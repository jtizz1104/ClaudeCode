// Planes de la propuesta comercial Timbra PY (mayo 2026), precios en guaraníes.
export const PLANES = {
  simple: {
    nombre: 'Simple', precio: 99000, documentosMes: 50, productos: 100,
    tipos: [1, 5],
    descripcion: 'Punto de entrada. Para empezar con volumen contenido.',
  },
  estandar: {
    nombre: 'Estándar', precio: 199000, documentosMes: 150, productos: 200,
    tipos: [1, 4, 5, 6, 7],
    descripcion: 'Equilibrio entre volumen y tipos de documento.',
    destacado: true,
  },
  pro: {
    nombre: 'Pro', precio: 299000, documentosMes: 400, productos: 500,
    tipos: [1, 4, 5, 6, 7],
    descripcion: 'Volumen alto y catálogo amplio. Facturación intensiva.',
  },
};

export const SETUP = { precio: 350000, descripcion: 'Carga del certificado, productos, timbrados, formatos de impresión y primer documento en producción.' };

export function plan(id) {
  return PLANES[id] || PLANES.simple;
}
