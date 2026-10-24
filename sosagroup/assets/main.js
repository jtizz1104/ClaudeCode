// SosaGroup — interacciones del sitio (sin dependencias)

// Endpoint del formulario (Formspree, Netlify Forms, backend propio…).
// Mientras esté vacío, los formularios validan pero no envían.
const FORM_ENDPOINT = "";

document.documentElement.classList.remove("no-js");

const t = (es) => window.sosaI18n?.t(es) ?? es;

// Header: borde al hacer scroll
const header = document.querySelector(".site-header");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menú móvil
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", t(open ? "Cerrar menú" : "Abrir menú"));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
}

// Desplegables del menú (Recursos)
document.querySelectorAll(".nav__trigger").forEach((btn) => {
  const close = () => btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true")));
  document.addEventListener("click", (e) => { if (!btn.parentElement.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { close(); btn.focus(); } });
  btn.parentElement.addEventListener("click", (e) => { const a = e.target.closest(".nav__menu a"); if (a) { close(); a.blur(); } });
});

// Pestañas "¿Cuál es su proyecto?"
document.querySelectorAll("[data-tabs]").forEach((root) => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
      if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
});

// Tarjetas de divisiones que abren una pestaña concreta
document.querySelectorAll("[data-tab]").forEach((link) => {
  link.addEventListener("click", () => document.getElementById(link.dataset.tab)?.click());
});

// Enlaces que preseleccionan el motivo en el formulario
document.querySelectorAll("[data-motivo]").forEach((link) => {
  link.addEventListener("click", () => {
    const sel = document.getElementById("motivo");
    if (sel) sel.value = link.dataset.motivo;
  });
});

// Reseñas largas: "Leer más"
document.querySelectorAll(".review").forEach((card) => {
  const p = card.querySelector("blockquote p");
  if (!p || p.textContent.length < 360) return;
  card.classList.add("is-clamped");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "review__more";
  const label = () => { btn.textContent = t(card.classList.contains("is-clamped") ? "Leer más" : "Leer menos"); };
  label();
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => {
    const open = card.classList.toggle("is-clamped") === false;
    label();
    btn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("sosa:lang", label);
  p.parentElement.after(btn);
});

// Aparición al hacer scroll
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -10% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

// Buscador de Real Estate → filtra el mapa (o, sin mapa, completa el formulario)
const search = document.getElementById("re-search");
if (search) {
  search.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(search);
    const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (window.sosaApplyFilters) {
      window.sosaApplyFilters({ operacion: data.get("operacion"), zona: data.get("zona") });
      document.getElementById("explorar").scrollIntoView({ behavior: smooth });
      return;
    }
    const form = document.getElementById("re-form");
    const set = (name, value) => { const el = form.elements[name]; if (el && value) el.value = value; };
    set("operacion", data.get("operacion"));
    set("tipo", data.get("tipo"));
    set("zona", data.get("zona"));
    set("presupuesto", data.get("presupuesto"));
    document.getElementById("contacto").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    form.elements.nombre.focus({ preventScroll: true });
  });
}

// Formularios: validación accesible + envío
document.querySelectorAll("form[data-validate]").forEach((form) => {
  const status = form.querySelector(".form-status");
  const messages = () => ({
    valueMissing: t("Este campo es obligatorio."),
    typeMismatch: t("Revise el formato (ej.: nombre@correo.com)."),
  });
  const check = (el) => {
    const err = document.getElementById(el.getAttribute("aria-describedby")?.split(" ").find((id) => id.endsWith("-error")));
    const v = el.validity;
    const msg = v.valid ? "" : (v.valueMissing ? messages().valueMissing : v.typeMismatch ? messages().typeMismatch : el.validationMessage);
    if (el.type !== "radio" && el.type !== "checkbox") el.setAttribute("aria-invalid", String(!v.valid));
    if (err) err.textContent = msg;
    return v.valid;
  };
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("blur", () => { if (el.value || el.required) check(el); });
    el.addEventListener("change", () => check(el));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("input, select, textarea")].filter((el) => el.willValidate);
    const invalid = fields.filter((el) => !check(el));
    if (invalid.length) { invalid[0].focus(); return; }

    const btn = form.querySelector('[type="submit"]');
    // Un formulario puede tener su propio destino (data-endpoint); si no, usa FORM_ENDPOINT
    const endpoint = form.dataset.endpoint || FORM_ENDPOINT;
    if (!endpoint) {
      status.className = "form-status form-status--warn";
      status.textContent = t("Vista previa: el envío del formulario todavía no está conectado.");
      return;
    }
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json().catch(() => ({}));
      if (data.success === false || data.success === "false") throw new Error(data.message);
      form.reset();
      status.className = "form-status form-status--ok";
      status.textContent = t("¡Gracias! Recibimos su solicitud y le escribiremos para coordinar la entrevista.");
    } catch (err) {
      console.warn("Formulario:", err);
      status.className = "form-status form-status--warn";
      // FormSubmit pide confirmar la casilla de destino antes del primer envío
      status.textContent = /activat/i.test(err?.message || "")
        ? t("El formulario está pendiente de activación: en la casilla que recibe las consultas hay un correo de FormSubmit con el enlace \"Activate Form\".")
        : t("No pudimos enviar el formulario. Intente de nuevo o escríbanos por WhatsApp.");
    } finally {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      status.focus();
    }
  });
});

// Ventana de bienvenida: aparece a los 3 segundos, una vez por visitante cada 7 días
const welcome = document.getElementById("welcome");
if (welcome && typeof welcome.showModal === "function") {
  const KEY = "sosa-welcome", WEEK = 7 * 24 * 3600 * 1000;
  let seen = 0;
  try { seen = Number(localStorage.getItem(KEY)) || 0; } catch {}
  const close = () => welcome.open && welcome.close();
  welcome.addEventListener("click", (e) => {
    if (e.target === welcome || e.target.closest("[data-close]")) close();
  });
  if (Date.now() - seen > WEEK) {
    setTimeout(() => {
      const busy = document.activeElement?.matches("input, select, textarea") || document.querySelector("dialog[open]");
      if (busy) return;
      welcome.showModal();
      try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    }, 3000);
  }
}

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Video de fondo: se muestra al empezar a reproducirse y se pausa cuando la portada no está a la vista
document.querySelectorAll(".hero__video").forEach((v) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { v.removeAttribute("autoplay"); v.pause(); return; }
  v.addEventListener("playing", () => v.classList.add("is-playing"));
  if (!v.paused && v.readyState > 2) v.classList.add("is-playing");
  v.addEventListener("timeupdate", () => v.classList.add("is-playing"), { once: true });
  const play = () => v.play().catch(() => {});
  play();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : v.pause())).observe(v);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? v.pause() : play()));
});

// Música de fondo opcional (se activa con el botón; arranca suave)
document.querySelectorAll(".hero__sound").forEach((btn) => {
  const audio = btn.parentElement.querySelector(".hero__audio");
  if (!audio) return;
  audio.volume = 0;
  const txt = btn.querySelector(".hero__sound-txt");
  let fade;
  const ramp = (to, done) => {
    clearInterval(fade);
    fade = setInterval(() => {
      const v = audio.volume + (to > audio.volume ? 0.03 : -0.05);
      if ((to > audio.volume && v >= to) || (to <= audio.volume && v <= to)) { audio.volume = to; clearInterval(fade); done?.(); }
      else audio.volume = Math.min(1, Math.max(0, v));
    }, 60);
  };
  const set = (on) => {
    btn.setAttribute("aria-pressed", String(on));
    if (txt) txt.textContent = t(on ? "Silenciar" : "Activar sonido");
    btn.setAttribute("aria-label", t(on ? "Silenciar la música" : "Activar la música de fondo"));
  };
  set(false);
  btn.addEventListener("click", () => {
    if (audio.paused) { audio.play().then(() => { set(true); ramp(0.35); }).catch(() => {}); }
    else ramp(0, () => { audio.pause(); set(false); });
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && !audio.paused) { audio.pause(); set(false); } });
  document.addEventListener("sosa:lang", () => set(!audio.paused));
});
