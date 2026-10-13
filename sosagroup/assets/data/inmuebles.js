// Cartera de Sosa Group Real Estate que se muestra en el mapa.
//
// IMPORTANTE: todos los registros de abajo son EJEMPLOS para ver el mapa
// funcionando (ejemplo: true muestra la etiqueta "Ejemplo"). Reemplácelos
// por los inmuebles y desarrollos reales antes de publicar.
//
// Campos:
//   id          identificador único (texto)
//   tipo        "propiedad" | "desarrollo"
//   operacion   "venta" | "alquiler"
//   categoria   "departamento" | "casa" | "terreno" | "oficina"
//   titulo      título corto
//   zona        texto visible (barrio, ciudad)
//   zonaId      "asuncion" | "gran-asuncion" | "san-bernardino" | "encarnacion"
//   lat, lng    coordenadas (Google Maps → clic derecho sobre el punto → copiar)
//   precio      número en USD, o null para "Consultar"
//   dormitorios, banos, m2   opcionales
//   estado      solo desarrollos: "En pozo" | "En construcción" | "Entregado"
//   entrega     solo desarrollos: texto, ej. "2027"
//   unidades    solo desarrollos: texto, ej. "1 a 3 dormitorios"
//   foto        ruta a la imagen (ej. "assets/img/inmuebles/villa-morra.jpg") o null
//   descripcion una o dos frases
window.SOSA_INMUEBLES = [
  {
    id: "ej-01", ejemplo: true, tipo: "propiedad", operacion: "venta", categoria: "departamento",
    titulo: "Departamento de 2 dormitorios", zona: "Villa Morra, Asunción", zonaId: "asuncion",
    lat: -25.2925, lng: -57.5770, precio: 185000, dormitorios: 2, banos: 2, m2: 95, foto: null,
    descripcion: "Edificio con amenities, a pasos de shoppings y oficinas."
  },
  {
    id: "ej-02", ejemplo: true, tipo: "propiedad", operacion: "alquiler", categoria: "departamento",
    titulo: "Monoambiente amoblado", zona: "Carmelitas, Asunción", zonaId: "asuncion",
    lat: -25.2850, lng: -57.5655, precio: 750, dormitorios: 1, banos: 1, m2: 48, foto: null,
    descripcion: "Ideal para recién llegados: listo para entrar a vivir."
  },
  {
    id: "ej-03", ejemplo: true, tipo: "propiedad", operacion: "venta", categoria: "casa",
    titulo: "Casa familiar con jardín", zona: "Las Mercedes, Asunción", zonaId: "asuncion",
    lat: -25.2965, lng: -57.6120, precio: 320000, dormitorios: 4, banos: 3, m2: 280, foto: null,
    descripcion: "Barrio residencial tranquilo, cerca de colegios."
  },
  {
    id: "ej-04", ejemplo: true, tipo: "propiedad", operacion: "venta", categoria: "oficina",
    titulo: "Oficina corporativa", zona: "Eje corporativo, Asunción", zonaId: "asuncion",
    lat: -25.2830, lng: -57.5610, precio: null, m2: 120, foto: null,
    descripcion: "Planta libre en torre de oficinas con estacionamiento."
  },
  {
    id: "ej-05", ejemplo: true, tipo: "propiedad", operacion: "venta", categoria: "casa",
    titulo: "Casa de descanso cerca del lago", zona: "San Bernardino", zonaId: "san-bernardino",
    lat: -25.3105, lng: -57.2955, precio: 210000, dormitorios: 3, banos: 2, m2: 190, foto: null,
    descripcion: "A pocos minutos del lago Ypacaraí."
  },
  {
    id: "ej-06", ejemplo: true, tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Torre residencial", zona: "Recoleta, Asunción", zonaId: "asuncion",
    lat: -25.2990, lng: -57.5880, precio: 120000, estado: "En construcción", entrega: "2027",
    unidades: "1 a 3 dormitorios", foto: null,
    descripcion: "Departamentos con amenities y financiación en cuotas."
  },
  {
    id: "ej-07", ejemplo: true, tipo: "desarrollo", operacion: "venta", categoria: "terreno",
    titulo: "Barrio cerrado", zona: "Luque, Gran Asunción", zonaId: "gran-asuncion",
    lat: -25.2700, lng: -57.4870, precio: 45000, estado: "En pozo", entrega: "2026",
    unidades: "Lotes desde 360 m²", foto: null,
    descripcion: "Lotes con seguridad, cerca del aeropuerto."
  },
  {
    id: "ej-08", ejemplo: true, tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Edificio frente a la costanera", zona: "Encarnación", zonaId: "encarnacion",
    lat: -27.3290, lng: -55.8740, precio: 95000, estado: "En pozo", entrega: "2028",
    unidades: "Monoambientes y 2 dormitorios", foto: null,
    descripcion: "Vista al río Paraná, a pasos de la playa."
  }
];
