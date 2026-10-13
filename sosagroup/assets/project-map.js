// SosaGroup — mapa de ubicación en la página de cada proyecto
(() => {
  const el = document.getElementById("project-map");
  if (!el || !window.L) return;
  const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng);
  const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 17);
  window.sosaBaseMap(map);
  map.on("focus click", () => map.scrollWheelZoom.enable());
  map.on("blur mouseout", () => map.scrollWheelZoom.disable());
  L.marker([lat, lng], {
    title: el.dataset.title, keyboard: false,
    icon: L.divIcon({
      className: "re-proj-wrap", iconSize: null, iconAnchor: [0, 0],
      html: `<span class="re-proj"><span class="re-proj__icon"><svg aria-hidden="true"><use href="#i-building"/></svg></span><span class="re-proj__txt"><strong></strong></span></span>`,
    }),
  }).addTo(map).getElement()?.querySelector("strong")?.append(el.dataset.title);
  new ResizeObserver(() => map.invalidateSize()).observe(el);
})();
