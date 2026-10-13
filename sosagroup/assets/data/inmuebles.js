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
//   foto        ruta a la imagen principal (ej. "assets/img/inmuebles/villa-morra.jpg") o null
//   descripcion una o dos frases (vista rápida del mapa)
//
// Campos opcionales para la ficha completa (se abre al hacer clic):
//   galeria          lista de fotos, ej. ["assets/img/inmuebles/torre-1.jpg", "assets/img/inmuebles/torre-2.jpg"]
//   descripcionLarga texto más completo del proyecto o la propiedad
//   tipologias       lista de unidades: [{ nombre: "1 dormitorio", m2: 52, precio: 120000 }, ...]
//   amenities        lista de textos, ej. ["Piscina", "Gimnasio", "Seguridad 24 h"]
//   brochure         ruta al PDF, ej. "assets/brochures/torre-residencial.pdf"
//                    (sin brochure, la ficha muestra "Solicitar el brochure")
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
    descripcion: "Departamentos con amenities y financiación en cuotas.",
    descripcionLarga: "Torre residencial en una de las zonas más buscadas de Asunción, cerca de colegios, shoppings y oficinas. Unidades de 1 a 3 dormitorios con balcón y cocheras, y financiación en cuotas durante la obra.",
    tipologias: [
      { nombre: "1 dormitorio", m2: 52, precio: 120000 },
      { nombre: "2 dormitorios", m2: 78, precio: 175000 },
      { nombre: "3 dormitorios", m2: 110, precio: 245000 }
    ],
    amenities: ["Piscina", "Gimnasio", "Quincho", "Cocheras", "Seguridad 24 h"],
    brochure: null
  },
  {
    id: "ej-07", ejemplo: true, tipo: "desarrollo", operacion: "venta", categoria: "terreno",
    titulo: "Barrio cerrado", zona: "Luque, Gran Asunción", zonaId: "gran-asuncion",
    lat: -25.2700, lng: -57.4870, precio: 45000, estado: "En pozo", entrega: "2026",
    unidades: "Lotes desde 360 m²", foto: null,
    descripcion: "Lotes con seguridad, cerca del aeropuerto.",
    descripcionLarga: "Barrio cerrado con lotes para construir la casa propia, a pocos minutos del aeropuerto y con acceso rápido a Asunción.",
    tipologias: [
      { nombre: "Lote estándar", m2: 360, precio: 45000 },
      { nombre: "Lote esquina", m2: 450, precio: 58000 }
    ],
    amenities: ["Seguridad 24 h", "Área verde", "Club house"],
    brochure: null
  },
  {
    id: "ej-08", ejemplo: true, tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Edificio frente a la costanera", zona: "Encarnación", zonaId: "encarnacion",
    lat: -27.3290, lng: -55.8740, precio: 95000, estado: "En pozo", entrega: "2028",
    unidades: "Monoambientes y 2 dormitorios", foto: null,
    descripcion: "Vista al río Paraná, a pasos de la playa.",
    descripcionLarga: "Edificio frente a la costanera de Encarnación, con vista al río Paraná y a pasos de la playa. Una opción para vivir o para renta turística.",
    tipologias: [
      { nombre: "Monoambiente", m2: 38, precio: 95000 },
      { nombre: "2 dormitorios", m2: 72, precio: 160000 }
    ],
    amenities: ["Piscina", "Solárium", "Cocheras"],
    brochure: null
  }
];
