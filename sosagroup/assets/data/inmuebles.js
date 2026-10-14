// Cartera de Sosa Group Real Estate que se muestra en el mapa.
//
// Proyectos reales cargados desde sus brochures. Un registro con ejemplo: true
// muestra la etiqueta "Ejemplo" (para pruebas).
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
//   zonaId      "asuncion" | "luque" | "lambare" | "san-lorenzo" | "fernando-de-la-mora" | "mariano-roque-alonso" | "gran-asuncion" (otras ciudades) | "el-delta" | "san-bernardino" | "encarnacion"
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
    id: "home-stay", slug: "home-stay-san-martin", tipo: "desarrollo", operacion: "venta", categoria: "departamento",
    titulo: "Home Stay San Martín", zona: "Av. San Martín y San Juan XXIII, Asunción", zonaId: "asuncion",
    // Ubicación confirmada por el equipo en Google Maps
    lat: -25.280271, lng: -57.570997, googleMaps: "https://maps.app.goo.gl/GWcUstapXRNfRVgh7", precio: null, entrega: "Julio 2027",
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
    // Ubicación confirmada por el equipo en Google Maps
    lat: -25.291259, lng: -57.567106, googleMaps: "https://maps.app.goo.gl/EcZFsWFZ2z23yaK77", precio: null,
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
  },
  {
    // Dirección confirmada por el equipo; coordenadas APROXIMADAS: confirmar en Google Maps y ajustar lat/lng
    id: "aura-villa-morra",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Avenida%20Doctor%20Guido%20Boggiani%20y%20Avenida%20Rep%C3%BAblica%20Argentina%2C%20Asunci%C3%B3n%2C%20Paraguay",
    slug: "aura-villa-morra",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Aura Japandi Residences",
    zona: "Av. Dr. Guido Boggiani casi Av. República Argentina, Villa Morra, Asunción",
    zonaId: "asuncion",
    lat: -25.2968,
    lng: -57.5768,
    precio: null,
    unidades: "Monoambientes, 1 y 2 dormitorios (31 a 71 m²)",
    desarrollador: "Avanza Desarrollos Inmobiliarios (grupo Avanza ONE)",
    foto: "assets/img/inmuebles/aura-avanza-fachada.jpg",
    galeria: ["assets/img/inmuebles/aura-avanza-fachada.jpg", "assets/img/inmuebles/aura-avanza-piscina.jpg", "assets/img/inmuebles/aura-avanza-rooftop.jpg", "assets/img/inmuebles/aura-avanza-lobby.jpg", "assets/img/inmuebles/aura-avanza-lounge.jpg", "assets/img/inmuebles/aura-avanza-grill.jpg", "assets/img/inmuebles/aura-avanza-wellness.jpg", "assets/img/inmuebles/aura-avanza-interior.jpg"],
    descripcion: "Aura – Japandi Residences: edificio residencial de estilo Japandi en Villa Morra, con rooftop de bienestar y unidades de 31 a 71 m².",
    descripcionLarga: "Aura – Japandi Residences es un edificio residencial que adopta la estética y la filosofía Japandi, fusión entre la calidez funcional del diseño escandinavo y la serenidad minimalista japonesa. Se ubica sobre la Avda. Dr. Guido Boggiani casi Av. República Argentina, en una de las zonas más conectadas de Asunción, cerca de Avda. Mariscal López, Avda. Rca. Argentina y los principales shoppings. Cuenta con planta baja de lobby y espacios comunes, un nivel de cocheras, diez niveles de residencias y la azotea SORA Rooftop con piscina panorámica, spa, wellness center y gimnasio. Ofrece tipologías desde monoambientes de 31 m² hasta unidades de dos dormitorios de 71 m². La desarrolladora opera unidades bajo sistema de rental pool.",
    datos: [["Estilo", "Japandi Residences"], ["Planta baja", "Lobby de acceso, cocheras y espacios comunes"], ["Piso 1", "Cocheras"], ["Pisos 2 al 11", "10 niveles de residencias"], ["Azotea", "SORA Rooftop"], ["Cocheras", "Con elevador de autos"], ["Tipologías", "Desde 31 m² hasta 71 m²"], ["Administración", "Sistema de rental pool"]],
    tipologias: [{"nombre": "Aura Studio (monoambiente)", "m2": 31}, {"nombre": "Aura Studio+ (monoambiente plus)", "m2": 32}, {"nombre": "Aura One (1 dormitorio)", "m2": 33}, {"nombre": "Aura One+ (1 dormitorio plus)", "m2": 46}, {"nombre": "Aura Suite (2 dormitorios)", "m2": 71}],
    amenities: ["Piscina panorámica", "Tereré lounge con fogonero", "Wellness center", "Community grill", "Spa", "Sala de masajes", "SUM", "Gimnasio", "Caminero panorámico", "Lobby", "Meeting points", "Tea nook", "Laundry room"],
    cerca: ["Eje Corporativo · 5 min", "Centro de Asunción · 10 min", "Costanera Sur · 10 min", "Aeropuerto · 15 min", "Shopping Villa Morra", "Shopping Mariscal", "Paseo Carmelitas", "Shopping Del Sol", "World Trade Center", "Paseo La Galería", "Supermercado Real", "Sanatorio Migone", "Hospital Bautista"],
    brochure: "assets/brochures/aura-villa-morra.pdf"
  },
  {
    // Esquina confirmada por el equipo; coordenadas APROXIMADAS: confirmar en Google Maps y ajustar lat/lng
    id: "belive-torreani",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=General%20Torreani%20y%20Alfredo%20Seiferheld%2C%20Asunci%C3%B3n%2C%20Paraguay",
    slug: "belive-torreani",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Belive Torreani",
    zona: "Gral. Torreani esq. Alfredo Seiferheld, Barrio Recoleta, Asunción",
    zonaId: "asuncion",
    lat: -25.2985,
    lng: -57.5885,
    precio: null,
    unidades: "Monoambientes, 1, 2 y 3 dormitorios (PH)",
    desarrollador: "Belive Real Estate",
    foto: "assets/img/inmuebles/belive-torreani-fachada.jpg",
    galeria: ["assets/img/inmuebles/belive-torreani-fachada.jpg", "assets/img/inmuebles/belive-torreani-piscina.jpg", "assets/img/inmuebles/belive-torreani-quincho-abierto.jpg", "assets/img/inmuebles/belive-torreani-quincho-climatizado.jpg", "assets/img/inmuebles/belive-torreani-gimnasio.jpg", "assets/img/inmuebles/belive-torreani-lobby.jpg", "assets/img/inmuebles/belive-torreani-dormitorio.jpg", "assets/img/inmuebles/belive-torreani-vista-aerea.jpg"],
    descripcion: "Edificio de 6 pisos con 44 departamentos, de monoambientes a PH de 3 dormitorios, con piscina, quincho y gimnasio en Barrio Recoleta.",
    descripcionLarga: "Belive Torreani es un edificio residencial de 6 pisos ubicado en la esquina de Gral. Torreani y Alfredo Seiferheld, en el Barrio Recoleta de Asunción. Reúne 44 departamentos con tipologías monoambiente, 1, 2 y 3 dormitorios, pensados para profesionales y familias jóvenes. Todas las unidades cuentan con balcón y amplios ventanales. El proyecto dispone de 46 cocheras en planta baja y subsuelo con accesos independientes, y amenities como piscina con deck, solarium, quinchos, parrilleros, gimnasio y espacio de co-cooking.",
    datos: [["Altura", "6 pisos"], ["Departamentos", "44"], ["Cocheras", "46 (planta baja y subsuelo)"], ["Accesos", "Vehiculares independientes por nivel y peatonal por el lobby"], ["Pisos 1 a 4", "Monoambientes, 1 y 2 dormitorios"], ["Piso 5", "PH de 3 dormitorios con terraza"], ["Balcones", "En todas las unidades"]],
    tipologias: [{"nombre": "Monoambiente (100% vendido)", "m2": 35.7}, {"nombre": "1 dormitorio + 1 baño", "m2": 47.5}, {"nombre": "1 dormitorio + 2 baños (unidad 105, contrafrente)", "m2": 50.3}, {"nombre": "1 dormitorio + 2 baños (unidad 104, frente)", "m2": 50.8}, {"nombre": "1 dormitorio + 2 baños (unidad 102, frente)", "m2": 53.2}, {"nombre": "2 dormitorios + 2 baños", "m2": 65.5}, {"nombre": "PH 3 dormitorios (unidad 504)", "m2": 119}, {"nombre": "PH 3 dormitorios (unidad 503)", "m2": 131}, {"nombre": "PH 3 dormitorios (unidades 501-502)", "m2": 133}],
    amenities: ["Quincho climatizado", "Quincho al aire libre", "Parrilleros", "Gimnasio equipado", "Espacio de co-cooking", "Terraza", "Piscina con deck", "Solarium", "Front desk"],
    cerca: ["Colegio Paraguayo Japonés", "Tribunal Superior de Justicia Electoral", "Av. Choferes del Chaco", "Av. República Argentina", "Av. Eusebio Ayala"],
    brochure: "assets/brochures/belive-torreani.pdf"
  },
  {
    // Ubicación APROXIMADA (estimada del mapa del brochure): confirmar en Google Maps y ajustar lat/lng
    id: "riverside-zafiro",
    slug: "riverside-zafiro",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Riverside Zafiro",
    zona: "Junto al Puente Remanso, El Delta, Nueva Asunción (Chaco)",
    zonaId: "el-delta",
    lat: -25.2035,
    lng: -57.565,
    precio: null,
    unidades: "3 y 4 dormitorios en suite y penthouses (283 a 710 m²)",
    foto: "assets/img/inmuebles/riverside-zafiro-aerea.jpg",
    galeria: ["assets/img/inmuebles/riverside-zafiro-aerea.jpg", "assets/img/inmuebles/riverside-zafiro-fachada.jpg", "assets/img/inmuebles/riverside-zafiro-vista-rio.jpg", "assets/img/inmuebles/riverside-zafiro-lobby.jpg", "assets/img/inmuebles/riverside-zafiro-kids-room.jpg", "assets/img/inmuebles/riverside-zafiro-living.jpg", "assets/img/inmuebles/riverside-zafiro-interior.jpg", "assets/img/inmuebles/riverside-zafiro-dormitorio.jpg"],
    descripcion: "Edificio de lujo frente al río Paraguay en El Delta, con departamentos de 3 y 4 dormitorios desde 283 m² y penthouses con piscina.",
    descripcionLarga: "Riverside Zafiro forma parte de Riverside – Las Terrazas del Delta, un conjunto de cinco edificios con acceso directo al río Paraguay, marinas privadas y campo de golf, diseñado por el estudio Gómez Platero. Ofrece departamentos de 3 y 4 dormitorios en suite, de 283 m² a 710 m², con terrazas panorámicas, ventanales de piso a techo y parrillero en balcones-terraza. Las unidades de planta baja cuentan con jardín propio y los penthouses del nivel 7 incluyen quincho y piscina. Las terminaciones incluyen climatización central VRV, mesadas de cuarzo, porcelanatos de gran formato, ascensores con palier privado y grupo generador con cobertura del 100%.",
    datos: [["Conjunto", "Riverside – Las Terrazas del Delta (5 edificios)"], ["Diseño", "Estudio Gómez Platero"], ["Niveles", "Subsuelo, planta baja, niveles 1 a 7 y azotea"], ["Unidades", "46 (según listado de unidades de los planos)"], ["Superficies", "Desde 283 m² hasta 710 m² (área vendible)"], ["Dormitorios", "3 y 4 dormitorios en suite, con dependencia de servicio"], ["Cocheras", "117 cocheras, 16 cocheras dobles y 15 para motos en subsuelo"], ["Bauleras", "48"], ["Departamentos de servicio", "14"], ["Ascensores", "Ascensores con palier privado y ascensor de servicio para 15 personas"], ["Climatización", "Aire acondicionado central tipo VRV, frío/calor"], ["Energía", "Grupo generador con cobertura del 100%"], ["Comercializa", "SosaGroup Real Estate · Silvana Gimenez"]],
    tipologias: [{"nombre": "Tipología A – Planta baja con jardín, 3 dormitorios (unidades 001 y 004)", "m2": 615}, {"nombre": "Tipología B – Planta baja con jardín, 3 dormitorios (unidades 002 y 003)", "m2": 522}, {"nombre": "Tipología C1 – 4 dormitorios, niveles 1 a 4", "m2": 414}, {"nombre": "Tipología C2 – 3 dormitorios, niveles 5 y 6", "m2": 349}, {"nombre": "Tipología D – 3 dormitorios, niveles 1 a 6", "m2": 311}, {"nombre": "Tipología E – 3 dormitorios, niveles 1 a 7", "m2": 283}, {"nombre": "Penthouse A – 3 dormitorios, quincho y piscina, nivel 7 (unidades 701 y 706)", "m2": 396}, {"nombre": "Penthouse B – 3 dormitorios, quincho y piscina, nivel 7 (unidades 702 y 705)", "m2": 413}],
    amenities: ["Piscina y solarium (160 m²)", "Gimnasio", "Kids Room", "Teens Room", "Área de co-working y business center", "Dos quinchos climatizados", "Estacionamiento de cortesía para visitas", "Acceso directo al río Paraguay, marinas privadas y campo de golf (conjunto Riverside)"],
    cerca: ["Acceso al Puente Héroes del Chaco · 5 minutos", "Nuevo Eje Corporativo de Asunción · 15 minutos", "Centro de Asunción · 20 minutos"],
    brochure: "assets/brochures/riverside-zafiro.pdf"
  },
  {
    // Ubicación APROXIMADA (estimada del mapa del brochure): confirmar en Google Maps y ajustar lat/lng
    id: "terrazas-malibu",
    slug: "terrazas-malibu",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "casa",
    titulo: "Terrazas Malibú",
    zona: "Frente a la laguna, al norte de El Delta, Nueva Asunción (Chaco)",
    zonaId: "el-delta",
    lat: -25.2060,
    lng: -57.5850,
    precio: null,
    unidades: "30 casas frente a la laguna (20 Tipo A y 10 Tipo B)",
    foto: "assets/img/inmuebles/terrazas-malibu-fachada-laguna.jpg",
    galeria: ["assets/img/inmuebles/terrazas-malibu-fachada-laguna.jpg", "assets/img/inmuebles/terrazas-malibu-laguna.jpg", "assets/img/inmuebles/terrazas-malibu-casa-b-laguna.jpg", "assets/img/inmuebles/terrazas-malibu-casa-b-jardin.jpg", "assets/img/inmuebles/terrazas-malibu-living-laguna.jpg", "assets/img/inmuebles/terrazas-malibu-living.jpg", "assets/img/inmuebles/terrazas-malibu-cocina-galeria.jpg", "assets/img/inmuebles/terrazas-malibu-dormitorio.jpg"],
    descripcion: "30 casas de dos plantas frente a una laguna dentro de El Delta, con terrazas que siguen la topografía y vistas abiertas al agua.",
    descripcionLarga: "Terrazas Malibú es un proyecto de 30 viviendas ubicado frente a una laguna, dentro del desarrollo El Delta. Las casas aprovechan los desniveles del terreno para crear terrazas que conectan el interior con el entorno, con vistas a la laguna desde cada ambiente. El concepto es el de una casa-mirador, con hormigón, madera y vidrio como materiales principales. Se ofrecen dos tipologías de dos plantas, de 515 y 530 m² construidos aproximadamente, con cochera para 4 vehículos. El entorno incluye campo de golf, marinas, área multideportiva, zona comercial y sector corporativo.",
    datos: [["Tipo", "Casas de dos plantas frente a laguna"], ["Unidades", "30 (20 Tipo A, 10 Tipo B)"], ["Superficie construida", "515,43 m² (Tipo A) y 529,58 m² (Tipo B)"], ["Cocheras", "4 vehículos por vivienda"], ["Materiales", "Hormigón, madera y vidrio"], ["Desarrollo", "Dentro de El Delta"], ["Seguridad", "Pórticos de acceso con seguridad 24 hs"], ["Comercializa", "SosaGroup Real Estate · Silvana Gimenez"]],
    tipologias: [{"nombre": "Vivienda Tipo A (321,83 m² cubiertos + 193,60 m² semicubiertos, 4 cocheras)", "m2": 515.43}, {"nombre": "Vivienda Tipo B (337,18 m² cubiertos + 192,40 m² semicubiertos, 4 cocheras)", "m2": 529.58}],
    amenities: ["Frente a laguna", "Campo de golf", "Área multideportiva", "Marinas", "Zona comercial", "Sector corporativo", "Pórticos de acceso con seguridad 24 hs", "Plantas de tratamiento de agua potable y efluentes", "Desagüe cloacal por vacío", "Cableado subterráneo", "Sistema de riego sustentable", "Protección del ecosistema (fauna y flora)"],
    cerca: ["Acceso al nuevo Puente Héroes del Chaco · 5 min", "Nuevo Eje Corporativo · 15 min", "Centro de Asunción · 20 min"],
    brochure: "assets/brochures/terrazas-malibu.pdf"
  },
  {
    // Ubicación APROXIMADA (estimada del mapa del brochure): confirmar en Google Maps y ajustar lat/lng
    id: "el-delta",
    slug: "el-delta",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "terreno",
    titulo: "El Delta",
    zona: "El Delta, frente a Asunción (Chaco)",
    zonaId: "el-delta",
    lat: -25.2200,
    lng: -57.5920,
    precio: null,
    unidades: "Lotes desde 1.200 m², residencias desde 500 m² y departamentos de 2 a 4 dormitorios",
    foto: "assets/img/inmuebles/el-delta-aerea.jpg",
    galeria: ["assets/img/inmuebles/el-delta-aerea.jpg", "assets/img/inmuebles/el-delta-nautico.jpg", "assets/img/inmuebles/el-delta-terrazas.jpg", "assets/img/inmuebles/el-delta-malibu.jpg", "assets/img/inmuebles/el-delta-golf.jpg", "assets/img/inmuebles/el-delta-club-house.jpg", "assets/img/inmuebles/el-delta-marina.jpg", "assets/img/inmuebles/el-delta-interior.jpg"],
    descripcion: "Desarrollo de 1.600 ha sobre el río Paraguay con barrios cerrados, lagunas, golf de 18 hoyos, marinas y zona comercial y corporativa.",
    descripcionLarga: "El Delta es un complejo de condominios, espacios comunes, áreas verdes, zonas comerciales y gastronómicas y centro corporativo que forman parte de 1.600 hectáreas sobre la margen derecha del río Paraguay. Reúne varios desarrollos: La Isla del Delta (66 lotes desde 1.200 m²), Barrio Norte (300 lotes con 28 ha de lagunas), Barrio Náutico (68 ha con playa y canal náutico), Terrazas Malibú (30 residencias frente a laguna con muelle), Riverside Zafiro / Las Terrazas del Delta (46 departamentos de 283 a 710 m²) y Río Verde (departamentos de 2 y 3 dormitorios en suite). Cuenta con pórticos de acceso con seguridad 24 hs, planta de tratamiento de agua potable y efluentes, cableado subterráneo y sistema de riego sustentable. Se complementa con la Marina del Delta, la cancha de golf Tarumá Golf, Las Palmas Street Mall, un sector corporativo y zona franca.",
    datos: [["Superficie total", "1.600 hectáreas"], ["La Isla del Delta", "66 lotes desde 1.200 m², pórtico vigilado 24 h"], ["Barrio Norte", "300 lotes · 28 ha de lagunas · 9 ha de áreas verdes"], ["Barrio Náutico", "68 ha totales · 20 ha de área verde · 5 ha de playa y canal náutico"], ["Terrazas Malibú", "30 residencias a partir de 500 m², muelle exclusivo"], ["Riverside Zafiro / Las Terrazas del Delta", "46 departamentos de 283 a 710 m², 3 y 4 dormitorios en suite"], ["Río Verde", "Departamentos de 2 y 3 dormitorios en suite"], ["Marinas", "Marina 1 a 400 m del Acceso 1 · Marina 2 a 3,2 km del Acceso 3 · Marina 3 a 1,5 km del Acceso 4"], ["Golf", "18 hoyos, franja de seguridad de 130 m"], ["Accesos", "4 accesos"], ["Comercializa", "SosaGroup Real Estate · Silvana Gimenez"]],
    tipologias: [{"nombre": "Lote La Isla del Delta (desde)", "m2": 1200}, {"nombre": "Terrazas Malibú – Casa A (515,43 m² construidos, 4 cocheras)", "m2": 515.43}, {"nombre": "Terrazas Malibú – Casa B (529,58 m² construidos, 4 cocheras)", "m2": 529.58}, {"nombre": "Riverside Zafiro – Departamento 3 y 4 dormitorios en suite (283 a 710 m²)", "m2": 283}, {"nombre": "Río Verde – Departamento 2 y 3 dormitorios en suite", "m2": null}],
    amenities: ["Pórticos de acceso con seguridad 24 hs", "Lagunas y áreas verdes de recreación", "Cancha de golf de 18 hoyos (Tarumá Golf) con Club House", "Marinas / complejo náutico", "Playa y canal náutico navegable", "Muelle exclusivo para residentes (Terrazas Malibú)", "Piscinas y solárium, gimnasio, kids room, teens room, co-working y dos quinchos climatizados (Riverside Zafiro)", "Zona comercial y de servicios: locales gastronómicos, supermercado, farmacia, gimnasio y tiendas (Las Palmas Street Mall)", "Zona gastronómica", "Centro de negocios / sector corporativo", "Zona franca", "Planta de tratamiento de agua potable y efluentes", "Desagüe cloacal por vacío", "Cableado subterráneo", "Sistema de riego sustentable"],
    cerca: ["Acceso al nuevo Puente Héroes del Chaco · 5 minutos", "Nuevo Eje Corporativo de Asunción · 15 minutos", "Centro de Asunción · 20 minutos"],
    brochure: "assets/brochures/el-delta.pdf"
  },
  {
    // Ubicación tomada del enlace de Google Maps del brochure
    id: "torre-narciso",
    slug: "torre-narciso",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Torre Narciso",
    zona: "Narciso R. Colmán 1775, Asunción",
    zonaId: "asuncion",
    lat: -25.2800776,
    lng: -57.5652862,
    googleMaps: "https://www.google.com/maps/place/PC9M%2BWVH,+Asunci%C3%B3n+001527/@-25.2855005,-57.5684619,15z/data=!4m6!3m5!1s0x945da61d2f896539:0x45ac7d2235e9fbb0!8m2!3d-25.2800776!4d-57.5652862!16s%2Fg%2F11jtyk2_hz",
    precio: 87600,
    unidades: "Departamentos de 1, 2 y 3 dormitorios (46 a 97 m²)",
    desarrollador: "Grupo Urbanus",
    foto: "assets/img/inmuebles/torre-narciso-fachada.jpg",
    galeria: ["assets/img/inmuebles/torre-narciso-fachada.jpg", "assets/img/inmuebles/torre-narciso-acceso.jpg", "assets/img/inmuebles/torre-narciso-piscina.jpg", "assets/img/inmuebles/torre-narciso-lobby.jpg", "assets/img/inmuebles/torre-narciso-gimnasio.jpg", "assets/img/inmuebles/torre-narciso-quincho.jpg", "assets/img/inmuebles/torre-narciso-living-3d.jpg", "assets/img/inmuebles/torre-narciso-dormitorio.jpg"],
    descripcion: "Edificio boutique de 7 pisos con departamentos de 1, 2 y 3 dormitorios, piscina, gimnasio y quincho climatizado, cerca del Shopping del Sol.",
    descripcionLarga: "Torre Narciso es un edificio boutique de 7 pisos ubicado sobre la calle Narciso R. Colmán 1775, en Asunción, a metros del nuevo eje corporativo-financiero de la ciudad. Ofrece departamentos de 1, 2 y 3 dormitorios, con superficies propias de 46,08 m² a 97,05 m². En la azotea cuenta con piscina, gimnasio, quincho climatizado y sala de reuniones, además de recepción en planta baja y estacionamiento en planta baja y subsuelo. El plan de pago contempla una entrega del 20% y cuotas desde USD 2.000, con un plazo de obra de 20 meses. Desarrolla Grupo Urbanus; proyecta y construye Unotres Arquitectura; gerencia Cassava.",
    datos: [["Pisos", "7"], ["Tipologías", "1, 2 y 3 dormitorios"], ["Superficie propia", "46,08 a 97,05 m²"], ["Plazo de obra", "20 meses"], ["Entrega inicial", "20%"], ["Cuotas desde", "USD 2.000"], ["Cochera", "USD 15.000"], ["Desarrolla", "Grupo Urbanus"], ["Proyecta y construye", "Unotres Arquitectura"], ["Gerencia", "Cassava desarrollo y gestión"], ["Plazo de obra", "20 meses"]],
    tipologias: [{"nombre": "1 dormitorio D", "m2": 46.08, "precio": 87600}, {"nombre": "1 dormitorio E", "m2": 48.31, "precio": 91800}, {"nombre": "1 dormitorio B", "m2": 49.52, "precio": 89100}, {"nombre": "1 dormitorio A", "m2": 50.9, "precio": 91600}, {"nombre": "1 dormitorio C", "m2": 52.51, "precio": 94500}, {"nombre": "2 dormitorios", "m2": 82.91, "precio": 149200}, {"nombre": "3 dormitorios", "m2": 97.05, "precio": 182500}],
    amenities: ["Piscina en azotea", "Gimnasio", "Quincho climatizado", "Sala de reuniones", "Terraza en azotea", "Recepción", "Estacionamiento en planta baja y subsuelo", "Estacionamiento de bicicletas", "Bauleras"],
    cerca: ["Shopping del Sol · 2 minutos a pie", "Paseo La Galería · 4 minutos a pie", "Casa Rica Molas López · 5 minutos a pie"],
    brochure: "assets/brochures/torre-narciso.pdf"
  },
  {
    // Ubicación APROXIMADA (estimada del mapa del brochure): confirmar en Google Maps y ajustar lat/lng
    id: "sol-city",
    slug: "sol-city",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Sol City",
    zona: "Prof. Manuel Riquelme N° 1985 entre San Juan XXIII y Herib Campos Cervera, Las Lomas, Asunción",
    zonaId: "asuncion",
    lat: -25.2825,
    lng: -57.5655,
    precio: null,
    unidades: "Departamentos de 1 dormitorio, 1 dormitorio en dúplex, 2 dormitorios (tipos A y B), 3 dormitorios y 3 dormitorios Plus, de 57 a 201 m² propios",
    desarrollador: "Asunción Design Center (desarrolla, proyecta y construye); inversora: Axial",
    foto: "assets/img/inmuebles/solcity-fachada.jpg",
    galeria: ["assets/img/inmuebles/solcity-fachada.jpg", "assets/img/inmuebles/solcity-fachada-sol.jpg", "assets/img/inmuebles/solcity-lobby.jpg", "assets/img/inmuebles/solcity-piscina.jpg", "assets/img/inmuebles/solcity-quincho.jpg", "assets/img/inmuebles/solcity-gimnasio.jpg", "assets/img/inmuebles/solcity-coworking.jpg", "assets/img/inmuebles/solcity-interior.jpg"],
    descripcion: "Edificio residencial en el barrio Las Lomas de Asunción, con departamentos de 1 a 3 dormitorios y amenities en planta baja y roof top.",
    descripcionLarga: "Sol City es un edificio residencial ubicado sobre la calle Prof. Manuel Riquelme N° 1985, entre San Juan XXIII y Herib Campos Cervera, en el barrio Las Lomas de Asunción. Se encuentra en una calle tranquila y arbolada, a pasos de las principales avenidas, del Shopping del Sol, del Shopping Paseo La Galería y del World Trade Center. Ofrece departamentos de 1 dormitorio, 1 dormitorio en dúplex, 2, 3 y 3 dormitorios Plus, de 57 a 201 m² propios. Cuenta con recepción y área de coworking en planta baja, y gimnasio, quincho doble/SUM, terrazas, piscina y deck/solárium en el roof top. Es desarrollado, proyectado y construido por Asunción Design Center.",
    datos: [["Dirección", "Prof. Manuel Riquelme N° 1985"], ["Barrio", "Las Lomas, Asunción"], ["Tipologías", "1, 1 dúplex, 2, 3 y 3 Plus dormitorios"], ["Superficies", "57 a 201 m² propios"], ["Desarrolla y construye", "Asunción Design Center"], ["Inversora", "Axial"], ["Terminaciones", "Pisos de porcelanato, mesadas de granito natural, carpintería de aluminio"], ["Equipamiento", "Horno, anafe y purificador; acondicionadores de aire frío/calor; sistema de agua caliente"]],
    tipologias: [{"nombre": "1 dormitorio", "m2": 57}, {"nombre": "1 dormitorio en dúplex", "m2": 72}, {"nombre": "2 dormitorios tipo A", "m2": 88}, {"nombre": "2 dormitorios tipo B", "m2": 88}, {"nombre": "3 dormitorios", "m2": 112}, {"nombre": "3 dormitorios Plus", "m2": 201}],
    amenities: ["Recepción", "Área de coworking", "Gimnasio", "Quincho doble / SUM", "Terrazas", "Piscina", "Deck / solárium"],
    cerca: ["Shopping del Sol · a pasos", "Shopping Paseo La Galería · a pasos", "World Trade Center · a pasos", "Hilton Garden Inn · a pasos", "Av. Aviadores del Chaco · a pasos"],
    brochure: "assets/brochures/sol-city.pdf"
  },
  {
    // Ubicación APROXIMADA (estimada del mapa del brochure): confirmar en Google Maps y ajustar lat/lng
    id: "rootz-recoleta",
    slug: "rootz-recoleta",
    tipo: "desarrollo",
    operacion: "venta",
    categoria: "departamento",
    titulo: "Rootz Studio Recoleta",
    zona: "Emilio Hassler y Gral. Torreani Viera, Barrio Recoleta, Asunción",
    zonaId: "asuncion",
    lat: -25.2925,
    lng: -57.5835,
    precio: null,
    unidades: "Monoambientes (27,5 y 35 m²) y departamentos de 1 dormitorio (desde 44,7 m²)",
    desarrollador: "ROOTZ Desarrollos Inmobiliarios",
    foto: "assets/img/inmuebles/rootz-recoleta-fachada.jpg",
    galeria: ["assets/img/inmuebles/rootz-recoleta-fachada.jpg", "assets/img/inmuebles/rootz-recoleta-fachada-superior.jpg", "assets/img/inmuebles/rootz-recoleta-piscina.jpg", "assets/img/inmuebles/rootz-recoleta-terraza.jpg", "assets/img/inmuebles/rootz-recoleta-living-comedor.jpg", "assets/img/inmuebles/rootz-recoleta-living.jpg", "assets/img/inmuebles/rootz-recoleta-cocina.jpg", "assets/img/inmuebles/rootz-recoleta-dormitorio.jpg"],
    descripcion: "Edificio de 8 niveles de monoambientes y departamentos de 1 dormitorio en Recoleta, con piscina, quincho, gimnasio y coworking.",
    descripcionLarga: "Studio Recoleta es un proyecto de ROOTZ Desarrollos Inmobiliarios en el Barrio Recoleta de Asunción, orientado a la inversión y a la primera vivienda. El edificio cuenta con 8 niveles de departamentos, además de subsuelo, planta baja y azotea. Ofrece monoambientes de 27,5 m², monoambientes PLUS de 35 m² y departamentos de 1 dormitorio desde 44,7 m², pensados para alquiler temporario o vivienda propia. La planta baja incluye lobby de acceso, sanitario y coworking, y la azotea reúne quincho climatizado, terraza, piscina con deck solárium, gimnasio, vestuarios y coworking. Se ubica a unos 300 metros del Shopping Mariscal López.",
    datos: [["Niveles", "8 niveles de departamentos + subsuelo, planta baja y azotea"], ["Planta tipo", "6 unidades (1 de 1 dormitorio, 4 monoambientes y 1 monoambiente PLUS)"], ["Cocheras", "En subsuelo y planta baja"], ["Planta baja", "Lobby de acceso, sanitario y coworking"], ["Azotea", "Quincho, coworking, gimnasio, duchas y sanitarios, piscina y solárium"], ["Perfil", "Inversión para alquiler temporario o primera vivienda"]],
    tipologias: [{"nombre": "Tipología B: Monoambiente", "m2": 27.5}, {"nombre": "Tipología B: Monoambiente PLUS", "m2": 35}, {"nombre": "Tipología A: 1 dormitorio", "m2": 44.7}],
    amenities: ["Quincho climatizado", "Terraza al aire libre", "Piscina", "Deck solárium con vistas panorámicas", "Gimnasio equipado", "Vestuarios y sanitarios", "Coworking en planta baja y azotea", "Lobby de acceso"],
    cerca: ["Shopping Mariscal López · 300 m", "Shopping Villa Morra", "Colegio Las Almenas", "Hotel Hub", "Marta Elena Catering & Restó", "La Cuadrita", "Av. Mariscal López"],
    brochure: "assets/brochures/rootz-recoleta.pdf"
  }
];
