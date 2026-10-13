// SosaGroup — idioma de la página
//
// Cada idioma tiene su propia página (castellano en la raíz, inglés en /en/,
// portugués en /pt/), generada con tools/build_i18n.py a partir del HTML en
// castellano y de assets/i18n-dict.js. Así los buscadores indexan cada idioma.
//
// Este script solo traduce los textos que generan los scripts (mapa, mensajes
// del formulario, "Leer más"), según el idioma de la página (<html lang>).

(() => {
  const DICT = window.SOSA_I18N || {};
  const lang = (document.documentElement.lang || "es").slice(0, 2);
  const norm = (s) => String(s).replace(/\s+/g, " ").trim();
  const t = (es) => (lang === "es" || es == null ? es : DICT[lang]?.[norm(es)] ?? es);

  // Recordar la elección del selector de idioma
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lang]");
    if (a) { try { localStorage.setItem("sosa-lang", a.dataset.lang); } catch {} }
  });

  window.sosaI18n = { t, lang };
})();
