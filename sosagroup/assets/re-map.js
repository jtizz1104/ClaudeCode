// SosaGroup Real Estate — mapa de propiedades y desarrollos (Leaflet)

(() => {
  const root = document.getElementById("explorar");
  const data = window.SOSA_INMUEBLES || [];
  if (!root || !window.L) return;

  const listEl = root.querySelector("[data-list]");
  const countEl = root.querySelector("[data-count]");
  const filters = root.querySelector("[data-filters]");
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Textos traducibles (assets/i18n-dict.js); {x} se reemplaza por el valor
  const t = (es) => window.sosaI18n?.t(es) ?? es;
  const tr = (es, vars = {}) => t(es).replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  const locale = () => ({ en: "en-US", pt: "pt-BR" })[window.sosaI18n?.lang] || "es-PY";
  const fmtUSD = (n) => new Intl.NumberFormat(locale(), { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const precio = (it) => {
    if (it.precio == null) return t("Consultar");
    const base = it.tipo === "desarrollo" ? tr("Desde {precio}", { precio: fmtUSD(it.precio) }) : fmtUSD(it.precio);
    return it.operacion === "alquiler" ? tr("{precio} / mes", { precio: base }) : base;
  };
  const specs = (it) => it.tipo === "desarrollo"
    ? [it.estado && t(it.estado), it.entrega && tr("Entrega {fecha}", { fecha: it.entrega }), it.unidades && t(it.unidades)].filter(Boolean)
    : [it.dormitorios && tr("{n} dorm.", { n: it.dormitorios }), it.banos && tr("{n} baños", { n: it.banos }), it.m2 && it.m2 + " m²"].filter(Boolean);
  const label = (it) => t(it.tipo === "desarrollo" ? "Desarrollo" : (it.operacion === "alquiler" ? "En alquiler" : "En venta"));
  const tag = () => `<span class="re-tag re-tag--demo">${t("Ejemplo")}</span>`;
  const icon = (it) => it.tipo === "desarrollo" ? "#i-building" : "#i-home";
  const photo = (it) => it.foto
    ? `<img src="${esc(it.foto)}" alt="" loading="lazy">`
    : `<span class="ph"><svg aria-hidden="true"><use href="${icon(it)}"/></svg></span>`;

  // Mapa
  const map = L.map(root.querySelector("[data-map]"), { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19, subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);
  map.on("focus click", () => map.scrollWheelZoom.enable());
  map.on("blur mouseout", () => map.scrollWheelZoom.disable());

  // Fondo de respaldo debajo de las calles: contorno del país y ciudades de referencia.
  // Se ve si las capas de calles no cargan (sin conexión, bloqueos de red).
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
        icon: L.divIcon({ className: "re-city", html: `<span>${name}</span>`, iconSize: null }),
      }).addTo(map));
  }

  const popupHTML = (it) => `
    <article class="re-pop">
      <div class="re-pop__img">${photo(it)}${it.ejemplo ? tag() : ""}</div>
      <div class="re-pop__body">
        <span class="re-tag re-tag--${it.tipo}">${label(it)}</span>
        <h3>${esc(t(it.titulo))}</h3>
        <p class="re-pop__zone">${esc(t(it.zona))}</p>
        <p class="re-pop__price">${esc(precio(it))}</p>
        <p class="re-pop__specs">${specs(it).map(esc).join(" · ")}</p>
        ${it.descripcion ? `<p class="re-pop__desc">${esc(t(it.descripcion))}</p>` : ""}
        <a class="btn btn--primary re-pop__cta" href="#contacto" data-consultar="${esc(it.id)}">${t("Consultar")}</a>
      </div>
    </article>`;

  const entries = data.map((it) => {
    const marker = L.marker([it.lat, it.lng], {
      title: t(it.titulo),
      alt: `${label(it)}: ${t(it.titulo)}, ${t(it.zona)}`,
      riseOnHover: true,
      icon: L.divIcon({
        className: "re-pin-wrap",
        html: `<span class="re-pin re-pin--${it.tipo}"><svg aria-hidden="true"><use href="${icon(it)}"/></svg></span>`,
        iconSize: [40, 48], iconAnchor: [20, 46], popupAnchor: [0, -44],
      }),
    });
    marker.bindPopup(() => popupHTML(it), { maxWidth: 300, minWidth: 260, className: "re-popup", autoPanPadding: [24, 24], closeButton: true });
    return { it, marker, card: null };
  });

  // Abrir con hover (mouse) y cerrar con un pequeño retardo para poder entrar al popup
  let closeTimer;
  const open = (e) => { clearTimeout(closeTimer); if (!e.marker.isPopupOpen()) e.marker.openPopup(); };
  const scheduleClose = (e) => { closeTimer = setTimeout(() => e.marker.closePopup(), 260); };
  entries.forEach((e) => {
    if (canHover) {
      e.marker.on("mouseover", () => open(e));
      e.marker.on("mouseout", () => scheduleClose(e));
    }
    e.marker.on("popupopen", (ev) => {
      const el = ev.popup.getElement();
      el.addEventListener("mouseenter", () => clearTimeout(closeTimer));
      el.addEventListener("mouseleave", () => scheduleClose(e));
      e.card?.classList.add("is-active");
    });
    e.marker.on("popupclose", () => e.card?.classList.remove("is-active"));
  });

  // Filtros
  const state = { tipo: "todos", operacion: "", zona: "" };
  const visible = (it) =>
    (state.tipo === "todos" || it.tipo === state.tipo) &&
    (!state.operacion || it.operacion === state.operacion || (state.operacion === "venta" && it.tipo === "desarrollo")) &&
    (!state.zona || it.zonaId === state.zona);

  // Agrupa puntos cercanos; al acercar el zoom se separan
  const layer = (L.markerClusterGroup ? L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 48,
    spiderfyOnMaxZoom: true,
    iconCreateFunction: (c) => L.divIcon({
      className: "re-cluster-wrap",
      html: `<span class="re-cluster">${c.getChildCount()}</span>`,
      iconSize: [46, 46],
    }),
  }) : L.featureGroup()).addTo(map);

  function render(fit = true) {
    layer.clearLayers();
    listEl.innerHTML = "";
    const shown = entries.filter((e) => visible(e.it));
    shown.forEach((e) => {
      layer.addLayer(e.marker);
      const li = document.createElement("li");
      li.innerHTML = `
        <button type="button" class="re-card">
          <span class="re-card__img">${photo(e.it)}</span>
          <span class="re-card__body">
            <span class="re-card__top"><span class="re-tag re-tag--${e.it.tipo}">${label(e.it)}</span>${e.it.ejemplo ? tag() : ""}</span>
            <strong>${esc(t(e.it.titulo))}</strong>
            <span class="re-card__zone">${esc(t(e.it.zona))}</span>
            <span class="re-card__price">${esc(precio(e.it))}</span>
          </span>
        </button>`;
      const btn = li.firstElementChild;
      e.card = btn;
      const show = () => {
        clearTimeout(closeTimer);
        if (layer.zoomToShowLayer) layer.zoomToShowLayer(e.marker, () => open(e));
        else { map.panInside(e.marker.getLatLng(), { padding: [80, 80] }); open(e); }
      };
      btn.addEventListener("click", show);
      btn.addEventListener("focus", show);
      if (canHover) {
        btn.addEventListener("mouseenter", show);
        btn.addEventListener("mouseleave", () => scheduleClose(e));
      }
      listEl.appendChild(li);
    });
    countEl.textContent = shown.length === 1 ? t("1 resultado") : tr("{n} resultados", { n: shown.length });
    if (!shown.length) listEl.innerHTML = `<li class="re-empty">${t("No hay resultados con estos filtros. Cuéntenos qué busca y le avisamos cuando tengamos opciones.")}</li>`;
    if (fit && shown.length) map.fitBounds(layer.getBounds(), { padding: [48, 48], maxZoom: 14 });
  }

  filters.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.name in state) { state[el.name] = el.value; render(); }
  });

  // Botón "Consultar" dentro del popup → completa el formulario
  root.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-consultar]");
    if (!a) return;
    const it = data.find((d) => d.id === a.dataset.consultar);
    const form = document.getElementById("re-form");
    if (!it || !form) return;
    form.elements.mensaje.value = tr("Me interesa: {titulo} ({zona}).", { titulo: t(it.titulo), zona: t(it.zona) });
    if (form.elements.operacion) form.elements.operacion.value = it.operacion === "alquiler" ? "alquilar" : "comprar";
    if (form.elements.zona) form.elements.zona.value = it.zonaId;
    setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), 400);
  });

  // Buscador de la portada → aplica filtros y baja al mapa
  window.sosaApplyFilters = (f) => {
    const op = { comprar: "venta", invertir: "venta", alquilar: "alquiler" }[f.operacion] || "";
    state.operacion = op;
    state.zona = f.zona || "";
    state.tipo = f.operacion === "invertir" ? "desarrollo" : "todos";
    filters.elements.operacion.value = state.operacion;
    filters.elements.zona.value = state.zona;
    filters.querySelector(`input[name="tipo"][value="${state.tipo}"]`).checked = true;
    render();
  };

  // Leaflet necesita recalcular el tamaño si el contenedor cambió
  new ResizeObserver(() => map.invalidateSize()).observe(root.querySelector("[data-map]"));

  // Cambio de idioma: textos de pines, listado y fichas
  document.addEventListener("sosa:lang", () => {
    map.closePopup();
    entries.forEach((e) => {
      const el = e.marker.getElement();
      e.marker.options.title = t(e.it.titulo);
      if (el) { el.title = t(e.it.titulo); el.setAttribute("alt", `${label(e.it)}: ${t(e.it.titulo)}, ${t(e.it.zona)}`); }
    });
    render(false);
  });
  render();
})();
