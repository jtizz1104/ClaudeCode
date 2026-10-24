// SosaGroup — capas base de los mapas (Leaflet)
//
// sosaBaseMap(map) agrega:
//   · "Calles": mapa de OpenStreetMap, con nombres de calles hasta zoom 19
//   · "Satélite": imagen satelital de Esri + calles y nombres de Esri encima
// Ninguna de las dos capas necesita clave ni cuenta.
//   · un contorno de Paraguay debajo, que se ve si las capas no cargan
//   · el selector de capas arriba a la derecha
// Para cambiar de proveedor (por ejemplo MapTiler con cuenta propia), editar
// las URLs de las capas de abajo.

(() => {
  const t = (es) => window.sosaI18n?.t(es) ?? es;
  const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  window.sosaBaseMap = (map) => {
    const streets = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20, maxNativeZoom: 19, attribution: OSM,
    });
    const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
    const esri = (layer, opts) => L.tileLayer(`${ESRI}${layer}/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 20, maxNativeZoom: 18, ...opts });
    const satellite = L.layerGroup([
      esri("World_Imagery", { attribution: "Imágenes &copy; Esri, Maxar, Earthstar Geographics" }),
      esri("Reference/World_Transportation"),
      esri("Reference/World_Boundaries_and_Places"),
    ]);
    streets.addTo(map);
    map.setMaxZoom(20);
    L.control.layers({ [t("Calles")]: streets, [t("Satélite")]: satellite }, null, { position: "topright", collapsed: false }).addTo(map);

    // Contorno de respaldo y ciudades de referencia
    if (window.SOSA_PARAGUAY_GEO) {
      map.createPane("base").style.zIndex = 150;
      L.geoJSON(window.SOSA_PARAGUAY_GEO, {
        pane: "base", interactive: false,
        style: (f) => f.properties.name === "Paraguay"
          ? { color: "#8a2454", weight: 1.5, fillColor: "#fbf6f8", fillOpacity: 1 }
          : { color: "#c9b8c0", weight: 1, fillColor: "#ece6e9", fillOpacity: 1 },
      }).addTo(map);
      [["Asunción", -25.2637, -57.5759], ["Luque", -25.2667, -57.4872], ["San Lorenzo", -25.3397, -57.5088],
       ["Lambaré", -25.3468, -57.6065], ["San Bernardino", -25.3125, -57.2978], ["Encarnación", -27.3306, -55.8667],
       ["Ciudad del Este", -25.5097, -54.6111]]
        .forEach(([name, lat, lng]) => L.marker([lat, lng], {
          pane: "base", interactive: false, keyboard: false,
          icon: L.divIcon({ className: "re-city", html: `<span>${t(name)}</span>`, iconSize: null }),
        }).addTo(map));
    }
    return { streets, satellite };
  };

  // Enlace a Google Maps con la ubicación exacta
  window.sosaGoogleMaps = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  // Street View en el punto (se abre en Google Maps; no necesita clave)
  window.sosaStreetView = (lat, lng) => `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
})();
