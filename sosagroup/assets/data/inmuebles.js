// Cartera de Sosa Group Real Estate que se muestra en el mapa.
//
// IMPORTANTE: los registros con ejemplo: true son EJEMPLOS para ver el mapa
// funcionando (muestran la etiqueta "Ejemplo"). Reemplácelos por los
// inmuebles reales antes de publicar. Home Stay San Martín y Matrisa Lillo
// son proyectos reales cargados desde sus brochures.
//
// Campos:
//   id          identificador único (texto)
//   googleMaps  opcional: enlace de Google Maps al lugar exacto (el de "Compartir"). Lo usa el botón
//               "Ver ubicación en Google Maps"; si falta, se arma con lat/lng.
//   slug        opcional: nombre de la página propia (real-estate/<slug>.html), sin espacios ni tildes.
//               La página se genera con  python3 tools/build_pages.py
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
//   desarrollador    empresa que desarrolla el proyecto
//   datos            datos extra para la ficha: [["Niveles", "22"], ["Departamentos", "115"]]
//   cerca            lugares cercanos: ["Shopping del Sol · 5 min", ...]
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
    id: "home-stay", slug: "home-stay-san-martin", tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Home Stay San Martín", zona: "Av. San Martín y San Juan XXIII, Asunción", zonaId: "asuncion",
    // Ubicación aproximada: verificar en Google Maps y ajustar lat/lng
    lat: -25.2822, lng: -57.5752, googleMaps: "https://maps.app.goo.gl/GWcUstapXRNfRVgh7", precio: null, entrega: "Julio 2027",
    unidades: "Suites, 1 y 2 dormitorios", desarrollador: "P&H Urban Development",
    foto: "assets/img/inmuebles/homestay-torre.jpg",
    galeria: [
      "assets/img/inmuebles/homestay-torre.jpg", "assets/img/inmuebles/homestay-fachada.jpg",
      "assets/img/inmuebles/homestay-vista-aerea.jpg", "assets/img/inmuebles/homestay-piscina.jpg",
      "assets/img/inmuebles/homestay-rooftop.jpg", "assets/img/inmuebles/homestay-lobby.jpg",
      "assets/img/inmuebles/homestay-living.jpg", "assets/img/inmuebles/homestay-suite.jpg",
      "assets/img/inmuebles/homestay-gimnasio.jpg", "assets/img/inmuebles/homestay-coffee-bar.jpg"
    ],
    descripcion: "Torre de 22 niveles con servicios de hotel 5 estrellas, a 150 m del Shopping del Sol.",
    descripcionLarga: "Diseñado para vivir o invertir con el lujo y las comodidades de un hotel 5 estrellas. Incluye administración y asesoramiento integral de alquileres temporales y tradicionales, desde la comercialización hasta la atención a los huéspedes. A 150 metros del Shopping del Sol y del Paseo La Galería, cerca de edificios corporativos, hoteles y bancos.",
    datos: [["Niveles", "22"], ["Departamentos", "115"], ["Ascensores", "3 + 1 de servicio"]],
    tipologias: [
      { nombre: "Suite single · Tipo 1", m2: 32.80 },
      { nombre: "Suite single · Tipo 2", m2: 34.07 },
      { nombre: "1 dormitorio · Tipo 1", m2: 42.81 },
      { nombre: "1 dormitorio · Tipo 2", m2: 45.37 },
      { nombre: "2 dormitorios · Tipo 1", m2: 67.11 },
      { nombre: "2 dormitorios · Tipo 2", m2: 70.98 },
      { nombre: "2 dormitorios · Tipo 3", m2: 63.47 }
    ],
    amenities: ["Piscina y solárium", "Rooftop lounge resto-bar", "Gimnasio", "2 quinchos con sala de juegos",
      "Lobby coffee-bar", "Zona coworking", "Self coin laundry", "Recepción 24 h", "Servicio de mucama 24 h",
      "Seguridad 24 h", "Grupo electrógeno para todo el edificio"],
    cerca: ["Shopping del Sol · 150 m", "Paseo La Galería", "World Trade Center"],
    brochure: "assets/brochures/home-stay-san-martin.pdf"
  },
  {
    id: "matrisa-lillo", slug: "matrisa-lillo", tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Matrisa Lillo", zona: "Eusebio Lillo Robles y Bélgica, Asunción", zonaId: "asuncion",
    // Ubicación aproximada: verificar en Google Maps y ajustar lat/lng
    lat: -25.2895, lng: -57.5695, googleMaps: "https://maps.app.goo.gl/EcZFsWFZ2z23yaK77", precio: null,
    unidades: "Monoambientes, 1, 2 y 3 dormitorios", desarrollador: "MATRISA",
    foto: "assets/img/inmuebles/lillo-torre.jpg",
    galeria: [
      "assets/img/inmuebles/lillo-torre.jpg", "assets/img/inmuebles/lillo-piscina-2.jpg",
      "assets/img/inmuebles/lillo-piscina.jpg", "assets/img/inmuebles/lillo-living.jpg",
      "assets/img/inmuebles/lillo-tipologia-3d.jpg"
    ],
    descripcion: "Inversiones inteligentes en ubicaciones clave, a minutos del Shopping del Sol y del Paseo La Galería.",
    descripcionLarga: "Edificio de MATRISA, desarrolladora fundada en 2017 por socios con experiencia inmobiliaria en Chile y otros países de Sudamérica, con tres pilares: ubicación estratégica, calidad y diseño. Una inversión pensada para la renta y la plusvalía a largo plazo, rodeada de comercios, universidades y centros de salud.",
    tipologias: [
      { nombre: "Monoambiente · Tipo 6 y 7", m2: 29 },
      { nombre: "1 dormitorio · Tipo 3", m2: 40 },
      { nombre: "2 dormitorios, 1 baño · Tipo 5", m2: 52 },
      { nombre: "2 dormitorios, 2 baños · Tipo 4", m2: 56 },
      { nombre: "2 dormitorios, 2 baños · Tipo 1", m2: 59 },
      { nombre: "3 dormitorios, 2 baños · Tipo 2", m2: 75 }
    ],
    amenities: ["Piscina panorámica", "Gimnasio con vista", "Quincho climatizado y abierto", "Coworking", "Laundry"],
    cerca: ["Facultad de Ciencias de la Salud (UC) · 3 min", "Universidad del Pacífico · 4 min", "Superseis Denis Roa · 4 min",
      "Shopping del Sol · 5 min", "Paseo La Galería · 5 min", "Shopping Mariscal · 7 min"],
    brochure: "assets/brochures/matrisa-lillo.pdf"
  }
];
