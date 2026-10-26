// SosaGroup Real Estate — mapa de propiedades y desarrollos (Leaflet)

(() => {
  // Raíz del sitio (este archivo está en assets/), para que las rutas de fotos y
  // brochures funcionen también desde /en/ y /pt/
  const SITE = new URL("../", document.currentScript?.src || location.href);
  const asset = (p) => (p && !/^(https?:|data:|\/)/.test(p) ? new URL(p, SITE).href : p);
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
    if (it.precio == null) return t("Precio a consultar");
    const base = it.tipo === "desarrollo" ? tr("Desde {precio}", { precio: fmtUSD(it.precio) }) : fmtUSD(it.precio);
    return it.operacion === "alquiler" ? tr("{precio} / mes", { precio: base }) : base;
  };
  // Precio corto para el marcador del mapa: "USD 185 mil", "USD 1,2 M", "USD 750 / mes"
  const precioCorto = (it) => {
    if (it.precio == null) return t("Consultar");
    const n = it.precio, nf = (v) => new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(v);
    const v = n >= 1e6 ? `${nf(n / 1e6)} M` : n >= 1e4 ? `${Math.round(n / 1000)}${window.sosaI18n?.lang === "en" ? "K" : " mil"}` : nf(n);
    return it.operacion === "alquiler" ? tr("{precio} / mes", { precio: "USD " + v }) : "USD " + v;
  };
  const specs = (it) => it.tipo === "desarrollo"
    ? [it.estado && t(it.estado), it.entrega && tr("Entrega {fecha}", { fecha: t(it.entrega) }), it.unidades && t(it.unidades)].filter(Boolean)
    : [it.dormitorios && tr("{n} dorm.", { n: it.dormitorios }), it.banos && tr("{n} baños", { n: it.banos }), it.m2 && it.m2 + " m²"].filter(Boolean);
  const label = (it) => t(it.tipo === "desarrollo" ? "Desarrollo" : (it.operacion === "alquiler" ? "En alquiler" : "En venta"));
  // Página propia del proyecto: real-estate/<slug>.html (en el mismo idioma)
  const projectUrl = (it) => `real-estate/${it.slug}.html`;
  const tag = () => `<span class="re-tag re-tag--demo">${t("Ejemplo")}</span>`;
  const icon = (it) => it.tipo === "desarrollo" ? "#i-building" : "#i-home";
  // Versión liviana de las fotos de inmuebles para las tarjetas (generada junto a cada .jpg)
  const small = (f) => (/^assets\/img\/inmuebles\/.+\.jpe?g$/.test(f) ? f.replace(/\.jpe?g$/, "-sm.webp") : f);
  const photo = (it) => it.foto
    ? `<img src="${esc(asset(small(it.foto)))}" data-full="${esc(asset(it.foto))}" alt="" loading="lazy">`
    : `<span class="ph"><svg aria-hidden="true"><use href="${icon(it)}"/></svg></span>`;

  // Mapa
  const map = L.map(root.querySelector("[data-map]"), { scrollWheelZoom: false, zoomControl: true });
  window.sosaBaseMap(map);
  // Los movimientos que hace la página (encuadrar, ir a una ficha) no filtran la lista
  let quietUntil = 0;
  const auto = (ms = 1500) => { quietUntil = Date.now() + ms; };
  map.on("focus click", () => map.scrollWheelZoom.enable());
  map.on("blur mouseout", () => map.scrollWheelZoom.disable());

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
        <button type="button" class="btn btn--primary re-pop__cta" data-detalle="${esc(it.id)}">${t(it.tipo === "desarrollo" ? "Ver el proyecto" : "Ver la propiedad")}</button>
      </div>
    </article>`;

  const pinIcon = (it) => it.tipo === "desarrollo"
    ? L.divIcon({
        className: "re-proj-wrap", iconSize: null, iconAnchor: [0, 0], popupAnchor: [0, -58],
        html: `<span class="re-proj"><span class="re-proj__icon"><svg aria-hidden="true"><use href="#i-building"/></svg></span><span class="re-proj__txt"><strong>${esc(t(it.titulo))}</strong><span>${esc(precio(it))}</span></span></span>`,
      })
    : L.divIcon({
        className: "re-proj-wrap", iconSize: null, iconAnchor: [0, 0], popupAnchor: [0, -44],
        html: `<span class="re-price re-price--${it.operacion === "alquiler" ? "alquiler" : "venta"}">${esc(precioCorto(it))}</span>`,
      });

  const entries = data.map((it) => {
    const marker = L.marker([it.lat, it.lng], {
      title: t(it.titulo),
      alt: `${label(it)}: ${t(it.titulo)}, ${t(it.zona)}`,
      riseOnHover: true,
      icon: pinIcon(it),
    });
    marker.bindPopup(() => popupHTML(it), { maxWidth: 300, minWidth: 260, className: "re-popup", autoPanPadding: [24, 24], closeButton: true });
    marker.on("click", () => { marker.closePopup(); openDetail(it); });
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

  // "Actualizar la lista al mover el mapa": la lista muestra solo lo que se ve en el mapa
  let followMap = true;
  const MapSync = L.Control.extend({
    options: { position: "bottomleft" },
    onAdd() {
      const box = L.DomUtil.create("label", "re-sync");
      box.innerHTML = `<input type="checkbox" checked><span></span>`;
      const input = box.querySelector("input");
      const txt = box.querySelector("span");
      this.setText = () => { txt.textContent = t("Actualizar la lista al mover el mapa"); };
      this.setText();
      input.addEventListener("change", () => { followMap = input.checked; renderList(); });
      L.DomEvent.disableClickPropagation(box);
      return box;
    },
  });
  const sync = new MapSync().addTo(map);
  const inView = (e) => !followMap || map.getBounds().pad(0.02).contains(e.marker.getLatLng());
  map.on("moveend", () => { if (Date.now() > quietUntil) renderList(); });

  function render(fit = true) {
    layer.clearLayers();
    entries.filter((e) => visible(e.it)).forEach((e) => layer.addLayer(e.marker));
    if (fit && layer.getLayers().length) { auto(); map.fitBounds(layer.getBounds(), { padding: [48, 48], maxZoom: 14 }); }
    renderList();
  }

  function renderList() {
    listEl.innerHTML = "";
    const filtered = entries.filter((e) => visible(e.it));
    const shown = filtered.filter(inView);
    shown.forEach((e) => {
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
        auto();
        if (layer.zoomToShowLayer) layer.zoomToShowLayer(e.marker, () => open(e));
        else { map.panInside(e.marker.getLatLng(), { padding: [80, 80] }); open(e); }
      };
      btn.addEventListener("click", () => { show(); openDetail(e.it); });
      btn.addEventListener("focus", () => { if (canHover) show(); });
      if (canHover) {
        btn.addEventListener("mouseenter", show);
        btn.addEventListener("mouseleave", () => scheduleClose(e));
      }
      listEl.appendChild(li);
    });
    countEl.textContent = shown.length === 1 ? t("1 resultado") : tr("{n} resultados", { n: shown.length });
    if (!shown.length) listEl.innerHTML = `<li class="re-empty">${t(filtered.length
      ? "No hay propiedades en esta zona del mapa. Aleje o mueva el mapa para ver más."
      : "No hay resultados con estos filtros. Cuéntenos qué busca y le avisamos cuando tengamos opciones.")}</li>`;
  }

  filters.addEventListener("submit", (ev) => ev.preventDefault());
  // Si falta la versión liviana de una foto, se usa la original
  root.addEventListener("error", (ev) => {
    const img = ev.target;
    if (img.tagName === "IMG" && img.dataset.full && img.src !== img.dataset.full) img.src = img.dataset.full;
  }, true);
  filters.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.name in state) { state[el.name] = el.value; render(); }
  });

  // "Ver el proyecto" en la vista rápida → ficha completa
  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-detalle]");
    if (b) { map.closePopup(); openDetail(data.find((d) => d.id === b.dataset.detalle)); }
  });

  // Botón "Consultar" (ficha) → completa el formulario
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-consultar]");
    if (!a) return;
    if (detail?.open) detail.close();
    const it = data.find((d) => d.id === a.dataset.consultar);
    const form = document.getElementById("re-form");
    if (!it || !form) return;
    form.elements.mensaje.value = a.hasAttribute("data-brochure")
      ? tr("Quiero recibir el brochure de {titulo} ({zona}).", { titulo: t(it.titulo), zona: t(it.zona) })
      : tr("Me interesa: {titulo} ({zona}).", { titulo: t(it.titulo), zona: t(it.zona) });
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

  // Tarjetas de "Zonas": cantidad de proyectos y botón para verlos en el mapa
  document.querySelectorAll("[data-zone]").forEach((card) => {
    const z = card.dataset.zone;
    const n = data.filter((d) => d.zonaId === z).length;
    const foot = document.createElement("p");
    foot.className = "zone__count";
    card.appendChild(foot);
    const paint = () => {
      foot.innerHTML = n
        ? `<a href="#explorar" data-zona-btn="${esc(z)}">${esc(n === 1 ? t("1 proyecto en el mapa") : tr("{n} proyectos en el mapa", { n }))} →</a>`
        : esc(t("Próximamente"));
    };
    paint();
    document.addEventListener("sosa:lang", paint);
  });
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-zona-btn]");
    if (!a) return;
    state.zona = a.dataset.zonaBtn;
    state.tipo = "todos";
    filters.elements.zona.value = state.zona;
    filters.querySelector('input[name="tipo"][value="todos"]').checked = true;
    render();
  });

  // Ficha completa (panel lateral)
  const detail = document.getElementById("re-detail");
  const detailBody = detail?.querySelector("[data-detail-body]");
  const row = (k, v) => (v ? `<div><dt>${t(k)}</dt><dd>${esc(v)}</dd></div>` : "");
  const detailHTML = (it) => {
    const fotos = (it.galeria && it.galeria.length ? it.galeria : it.foto ? [it.foto] : []);
    const gallery = fotos.length
      ? `<div class="rd-gallery">${fotos.map((f, i) => `<img src="${esc(asset(f))}" alt="${esc(t(it.titulo))} · ${i + 1}" loading="lazy">`).join("")}</div>`
      : `<div class="rd-gallery rd-gallery--empty">${photo(it)}<span>${t("Fotos del proyecto próximamente")}</span></div>`;
    const tipologias = (it.tipologias || []).length ? `
      <h3>${t("Tipologías")}</h3>
      <div class="rd-table"><table>
        <thead><tr><th>${t("Unidad")}</th><th>${t("Superficie")}</th><th>${t("Precio")}</th></tr></thead>
        <tbody>${it.tipologias.map((u) => `<tr><td>${esc(t(u.nombre))}</td><td>${u.m2 ? esc(String(u.m2).replace(".", window.sosaI18n?.lang === "en" ? "." : ",")) + " m²" : "—"}</td><td>${u.precio ? esc(tr("Desde {precio}", { precio: fmtUSD(u.precio) })) : esc(t("Consultar"))}</td></tr>`).join("")}</tbody>
      </table></div>` : "";
    const cerca = (it.cerca || []).length ? `<h3>${t("Cerca de")}</h3><ul class="rd-near">${it.cerca.map((c) => `<li><svg aria-hidden="true"><use href="#i-pin"/></svg>${esc(t(c))}</li>`).join("")}</ul>` : "";
    const amenities = (it.amenities || []).length ? `<h3>${t("Amenities")}</h3><ul class="rd-chips">${it.amenities.map((a) => `<li>${esc(t(a))}</li>`).join("")}</ul>` : "";
    const brochure = it.brochure
      ? `<a class="btn btn--primary" href="${esc(asset(it.brochure))}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-file"/></svg>${t("Ver brochure")}</a>
         <a class="btn btn--outline" href="${esc(asset(it.brochure))}" download>${t("Descargar brochure (PDF)")}</a>`
      : `<a class="btn btn--outline" href="#contacto" data-consultar="${esc(it.id)}" data-brochure>${t("Solicitar el brochure")}</a>`;
    return `
      ${gallery}
      <div class="rd-head">
        <div class="re-card__top"><span class="re-tag re-tag--${it.tipo}">${label(it)}</span>${it.ejemplo ? tag() : ""}</div>
        <h2 id="re-detail-title">${esc(t(it.titulo))}</h2>
        <p class="rd-zone"><svg aria-hidden="true"><use href="#i-pin"/></svg>${esc(t(it.zona))}</p>
        <p class="rd-price">${esc(precio(it))}</p>
      </div>
      <dl class="rd-facts">
        ${row("Estado", it.estado && t(it.estado))}${row("Entrega", it.entrega && t(it.entrega))}${row("Unidades", it.unidades && t(it.unidades))}
        ${row("Desarrolla", it.desarrollador)}${(it.datos || []).map(([k, v]) => row(k, t(v))).join("")}
        ${row("Dormitorios", it.dormitorios)}${row("Baños", it.banos)}${row("Superficie", it.m2 && it.m2 + " m²")}
      </dl>
      <p class="rd-desc">${esc(t(it.descripcionLarga || it.descripcion || ""))}</p>
      ${tipologias}${amenities}${cerca}
      <div class="rd-actions">
        ${it.slug ? `<a class="btn btn--primary" href="${esc(projectUrl(it))}">${t(it.tipo === "desarrollo" ? "Ver la página del proyecto" : "Ver la página de la propiedad")}</a>` : ""}
        ${brochure}
        <a class="btn btn--outline" href="${window.sosaStreetView(it.lat, it.lng)}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-eye"/></svg>${t("Ver la calle (Street View)")}</a>
        <a class="btn btn--outline" href="${esc(it.googleMaps || window.sosaGoogleMaps(it.lat, it.lng))}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-pin"/></svg>${t("Ver ubicación en Google Maps")}</a>
        <a class="btn btn--primary" href="#contacto" data-consultar="${esc(it.id)}">${t(it.tipo === "desarrollo" ? "Consultar por este proyecto" : "Consultar por esta propiedad")}</a>
      </div>`;
  };
  function openDetail(it) {
    if (!detail || !it) return;
    // Acercar el mapa a nivel de calle sobre la propiedad
    const e = entries.find((x) => x.it === it);
    if (e) {
      auto(2500);
      if (layer.zoomToShowLayer) layer.zoomToShowLayer(e.marker, () => map.setView(e.marker.getLatLng(), Math.max(map.getZoom(), 17)));
      else map.setView(e.marker.getLatLng(), 17);
    }
    detailBody.innerHTML = detailHTML(it);
    detailBody.scrollTop = 0;
    if (!detail.open) detail.showModal();
    try { history.replaceState(null, "", "#p-" + it.id); } catch {}
  }
  if (detail) {
    detail.addEventListener("click", (e) => { if (e.target === detail || e.target.closest("[data-detail-close]")) detail.close(); });
    detail.addEventListener("close", () => { try { history.replaceState(null, "", location.pathname + location.search); } catch {} });
    const fromHash = data.find((d) => location.hash === "#p-" + d.id);
    if (fromHash) setTimeout(() => openDetail(fromHash), 300);
  }

  // Leaflet necesita recalcular el tamaño si el contenedor cambió
  new ResizeObserver(() => map.invalidateSize()).observe(root.querySelector("[data-map]"));

  // Cambio de idioma: textos de pines, listado y fichas
  document.addEventListener("sosa:lang", () => {
    map.closePopup();
    entries.forEach((e) => {
      const el = e.marker.getElement();
      e.marker.options.title = t(e.it.titulo);
      e.marker.setIcon(pinIcon(e.it));
      if (el) { el.title = t(e.it.titulo); el.setAttribute("alt", `${label(e.it)}: ${t(e.it.titulo)}, ${t(e.it.zona)}`); }
    });
    sync.setText();
    render(false);
  });
  render();
})();
