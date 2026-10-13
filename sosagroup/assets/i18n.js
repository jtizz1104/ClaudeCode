// SosaGroup — idiomas (es / en / pt)
//
// El HTML está escrito en castellano. Este script traduce el texto visible y
// algunos atributos usando los diccionarios de assets/i18n-dict.js, cuyas
// claves son las frases originales en castellano. Si una frase no está en el
// diccionario, queda en castellano.

(() => {
  const LANGS = ["es", "en", "pt"];
  const DICT = window.SOSA_I18N || {};
  const ATTRS = ["placeholder", "aria-label", "alt", "title"];
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "svg", "SVG", "TEXTAREA"]);
  const hasLetters = /\p{L}/u;

  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const t = (es, lang = state.lang) => {
    if (lang === "es" || es == null) return es;
    const key = norm(String(es));
    return DICT[lang]?.[key] ?? es;
  };

  const state = { lang: "es", texts: [], attrs: [], meta: [] };

  function collect(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        for (let el = node.parentNode; el && el !== root.parentNode; el = el.parentNode) {
          if (SKIP.has(el.nodeName) || el.hasAttribute?.("data-no-i18n")) return NodeFilter.FILTER_REJECT;
        }
        return hasLetters.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const raw = n.nodeValue;
      const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
      state.texts.push({ node: n, es: norm(raw), lead, trail });
    }
    root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
      ATTRS.forEach((a) => {
        const v = el.getAttribute(a);
        if (v && hasLetters.test(v)) state.attrs.push({ el, a, es: v });
      });
    });
  }

  function apply(lang) {
    state.lang = lang;
    document.documentElement.lang = lang;
    state.texts.forEach((x) => { x.node.nodeValue = x.lead + t(x.es, lang) + x.trail; });
    state.attrs.forEach((x) => x.el.setAttribute(x.a, t(x.es, lang)));
    state.meta.forEach((x) => x.el.setAttribute("content", t(x.es, lang)));
    document.title = t(state.title, lang);
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("sosa-lang", lang); } catch {}
    document.dispatchEvent(new CustomEvent("sosa:lang", { detail: { lang } }));
  }

  function initial() {
    try { const saved = localStorage.getItem("sosa-lang"); if (LANGS.includes(saved)) return saved; } catch {}
    const nav = (navigator.languages || [navigator.language || "es"]).map((l) => l.slice(0, 2).toLowerCase());
    return nav.find((l) => LANGS.includes(l)) || "es";
  }

  state.title = document.title;
  document.querySelectorAll('meta[name="description"], meta[property^="og:"]').forEach((el) => {
    const v = el.getAttribute("content");
    if (v && hasLetters.test(v) && el.getAttribute("property") !== "og:type") state.meta.push({ el, es: v });
  });
  collect(document.body);

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (b) apply(b.dataset.lang);
  });

  // strings(): lista de frases de la página, útil para completar el diccionario
  const strings = () => [...new Set([state.title, ...state.meta.map((x) => x.es), ...state.texts.map((x) => x.es), ...state.attrs.map((x) => x.es)])];
  window.sosaI18n = { t: (es) => t(es), get lang() { return state.lang; }, set: apply, collect, strings };
  apply(initial());
})();
