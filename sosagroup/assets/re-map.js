// Sosa Group Real Estate — mapa de propiedades y desarrollos (Leaflet)

(() => {
  const root = document.getElementById("explorar");
  const data = window.SOSA_INMUEBLES || [];
  if (!root || !window.L) return;

  const listEl = root.querySelector("[data-list]");
  const countEl = root.querySelector("[data-count]");
  const filters = root.querySelector("[data-filters]");
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const fmtUSD = new Intl.NumberFormat("es-PY", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const precio = (it) => {
    if (it.precio == null) return "Consultar";
    const base = (it.tipo === "desarrollo" ? "Desde " : "") + fmtUSD.format(it.precio);
    return it.operacion === "alquiler" ? base + " / mes" : base;
  };
  const specs = (it) => it.tipo === "desarrollo"
    ? [it.estado, it.entrega && "Entrega " + it.entrega, it.unidades].filter(Boolean)
    : [it.dormitorios && it.dormitorios + " dorm.", it.banos && it.banos + " baños", it.m2 && it.m2 + " m²"].filter(Boolean);
  const label = (it) => it.tipo === "desarrollo" ? "Desarrollo" : (it.operacion === "alquiler" ? "En alquiler" : "En venta");
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

  const popupHTML = (it) => `
    <article class="re-pop">
      <div class="re-pop__img">${photo(it)}${it.ejemplo ? '<span class="re-tag re-tag--demo">Ejemplo</span>' : ""}</div>
      <div class="re-pop__body">
        <span class="re-tag re-tag--${it.tipo}">${label(it)}</span>
        <h3>${esc(it.titulo)}</h3>
        <p class="re-pop__zone">${esc(it.zona)}</p>
        <p class="re-pop__price">${esc(precio(it))}</p>
        <p class="re-pop__specs">${specs(it).map(esc).join(" · ")}</p>
        ${it.descripcion ? `<p class="re-pop__desc">${esc(it.descripcion)}</p>` : ""}
        <a class="btn btn--primary re-pop__cta" href="#contacto" data-consultar="${esc(it.id)}">Consultar</a>
      </div>
    </article>`;

  const entries = data.map((it) => {
    const marker = L.marker([it.lat, it.lng], {
      title: it.titulo,
      alt: `${label(it)}: ${it.titulo}, ${it.zona}`,
      riseOnHover: true,
      icon: L.divIcon({
        className: "re-pin-wrap",
        html: `<span class="re-pin re-pin--${it.tipo}"><svg aria-hidden="true"><use href="${icon(it)}"/></svg></span>`,
        iconSize: [40, 48], iconAnchor: [20, 46], popupAnchor: [0, -44],
      }),
    });
    marker.bindPopup(popupHTML(it), { maxWidth: 300, minWidth: 260, className: "re-popup", autoPanPadding: [24, 24], closeButton: true });
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
            <span class="re-card__top"><span class="re-tag re-tag--${e.it.tipo}">${label(e.it)}</span>${e.it.ejemplo ? '<span class="re-tag re-tag--demo">Ejemplo</span>' : ""}</span>
            <strong>${esc(e.it.titulo)}</strong>
            <span class="re-card__zone">${esc(e.it.zona)}</span>
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
    countEl.textContent = shown.length === 1 ? "1 resultado" : `${shown.length} resultados`;
    if (!shown.length) listEl.innerHTML = '<li class="re-empty">No hay resultados con estos filtros. Cuéntenos qué busca y le avisamos cuando tengamos opciones.</li>';
    if (fit && shown.length) map.fitBounds(layer.getBounds(), { padding: [48, 48], maxZoom: 14 });
  }

  filters.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.name in state) { state[t.name] = t.value; render(); }
  });

  // Botón "Consultar" dentro del popup → completa el formulario
  root.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-consultar]");
    if (!a) return;
    const it = data.find((d) => d.id === a.dataset.consultar);
    const form = document.getElementById("re-form");
    if (!it || !form) return;
    form.elements.mensaje.value = `Me interesa: ${it.titulo} (${it.zona}).`;
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
  render();
})();
