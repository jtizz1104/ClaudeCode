#!/usr/bin/env python3
"""Genera las subpáginas del sitio SosaGroup a partir de los datos.

  real-estate/<slug>.html        una página por proyecto con "slug" en assets/data/inmuebles.js
  guia-de-tramites/<slug>.html   una página por área de assets/data/guia.json

Usa como molde el encabezado y el pie de real-estate.html y de
guia-de-tramites.html, así cualquier cambio en esas páginas se refleja aquí.

Uso (desde la carpeta sosagroup/):
  python3 tools/build_pages.py     # genera las páginas en castellano
  python3 tools/build_i18n.py      # genera inglés y portugués (incluye estas páginas)
Requiere Node.js para leer assets/data/inmuebles.js.
"""
import html
import json
import re
from urllib.parse import quote
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://sosagroup.com.py/"
esc = lambda s: html.escape(str(s if s is not None else ""), quote=True)


def load_projects():
    js = ("global.window={};eval(require('fs').readFileSync(process.argv[1],'utf8'));"
          "process.stdout.write(JSON.stringify(window.SOSA_INMUEBLES))")
    out = subprocess.run(["node", "-e", js, str(ROOT / "assets/data/inmuebles.js")],
                         capture_output=True, text=True, check=True).stdout
    return [p for p in json.loads(out) if p.get("slug")]


def shell(source, keep_ids, back):
    """Encabezado y pie de una página existente, ajustados para una subcarpeta."""
    s = (ROOT / source).read_text(encoding="utf-8")
    top = s[: s.index('<main id="main">')]
    contact = s[s.index("    <!-- Contacto -->"): s.index("</main>")]
    bottom = s[s.index("</main>") + len("</main>"):]

    def fix(chunk):
        def repl(m):
            attr, val = m.group(1), m.group(2)
            if val.startswith("#"):
                frag = val[1:]
                if not frag or frag in keep_ids or frag.startswith(("i-", "f-")):
                    return m.group(0)
                return f'{attr}="../{back}#{frag}"'
            if re.match(r"^(https?:|mailto:|tel:|data:|/|javascript:)", val):
                return m.group(0)
            return f'{attr}="../{val}"'
        return re.sub(r'\b(href|src)="([^"]*)"', repl, chunk)

    return fix(top), fix(contact), fix(bottom)


def set_head(top, title, desc, ld, extra_css=""):
    top = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", top, flags=re.S)
    top = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(desc)}">', top)
    top = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(title)}">', top)
    top = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(desc)}">', top)
    top = re.sub(r'\s*<link rel="preload" as="image"[^>]*>', "", top)
    top = re.sub(r'(  <!-- seo:start[^>]*-->\n).*?(  <!-- seo:end -->)', r"\1\2", top, flags=re.S)
    top = re.sub(r'  <script type="application/ld\+json">.*?</script>\n',
                 "  <script type=\"application/ld+json\">\n  " + json.dumps(ld, ensure_ascii=False, indent=2).replace("\n", "\n  ") + "\n  </script>\n",
                 top, count=1, flags=re.S)
    if extra_css:
        top = top.replace('  <link rel="stylesheet" href="../assets/styles.css">', extra_css + '  <link rel="stylesheet" href="../assets/styles.css">')
    return top


def scripts(bottom, names):
    """Reemplaza los <script src> del pie por la lista indicada."""
    bottom = re.sub(r'  <script src="[^"]+" defer></script>\n', "", bottom)
    bottom = re.sub(r'\s*<dialog id="re-detail".*?</dialog>\n', "\n", bottom, flags=re.S)
    tags = "".join(f'  <script src="../assets/{n}" defer></script>\n' for n in names)
    return bottom.replace("</body>", tags + "</body>")


def srcset(f, sizes):
    """Versión liviana (-sm.webp, 640 px) para pantallas chicas, si existe."""
    sm = re.sub(r"\.jpe?g$", "-sm.webp", f)
    if sm == f or not (ROOT / sm).exists():
        return ""
    return f'srcset="../{esc(sm)} 640w, ../{esc(f)} 1600w" sizes="{sizes}"'


def m2(v):
    return f"{v:g}".replace(".", ",") + " m²" if v else "—"


# ---------------------------------------------------------------- proyectos
def project_page(p, top, contact, bottom):
    url = f"{BASE}real-estate/{p['slug']}.html"
    fotos = p.get("galeria") or ([p["foto"]] if p.get("foto") else [])
    main_img = fotos[0] if fotos else None
    facts = [("Entrega", p.get("entrega")), ("Unidades", p.get("unidades")), ("Desarrolla", p.get("desarrollador"))]
    facts += [tuple(d) for d in p.get("datos", [])]
    facts_html = "".join(f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in facts if v)
    precio = "Precio a consultar" if p.get("precio") is None else f"Desde USD {p['precio']:,}".replace(",", ".")
    brochure = (f'''<a class="btn btn--primary" href="../{esc(p['brochure'])}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-file"/></svg>Ver brochure</a>
            <a class="btn btn--outline" href="../{esc(p['brochure'])}" download>Descargar brochure (PDF)</a>''' if p.get("brochure")
                else '<a class="btn btn--primary" href="#contacto">Solicitar el brochure</a>')
    gmaps = p.get("googleMaps") or f"https://www.google.com/maps/search/?api=1&query={p['lat']},{p['lng']}"
    # Mapa de Google sin clave (vista satelital) y Street View, que se abre en Google Maps
    gembed = f"https://maps.google.com/maps?q={p['lat']},{p['lng']}&t=k&z=18&output=embed"
    street = f"https://www.google.com/maps/@?api=1&map_action=pano&viewpoint={p['lat']},{p['lng']}"
    gallery = "".join(f'<figure><img src="../{esc(f)}" {srcset(f, "(max-width: 600px) 92vw, 400px")} alt="{esc(p["titulo"])}" loading="lazy"></figure>' for f in fotos[1:])
    tip_rows = "".join(f"<tr><td>{esc(u['nombre'])}</td><td>{m2(u.get('m2'))}</td><td>{'Consultar' if not u.get('precio') else 'Desde USD ' + format(u['precio'], ',').replace(',', '.')}</td></tr>" for u in p.get("tipologias", []))
    amen = "".join(f"<li>{esc(a)}</li>" for a in p.get("amenities", []))
    cerca = "".join(f'<li><svg aria-hidden="true"><use href="#i-pin"/></svg>{esc(c)}</li>' for c in p.get("cerca", []))

    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "ApartmentComplex", "name": p["titulo"], "url": url, "description": p.get("descripcionLarga") or p.get("descripcion"),
         "image": [BASE + f for f in fotos], "address": {"@type": "PostalAddress", "streetAddress": p["zona"].rsplit(",", 1)[0], "addressLocality": "Asunción", "addressCountry": "PY"},
         "geo": {"@type": "GeoCoordinates", "latitude": p["lat"], "longitude": p["lng"]},
         "amenityFeature": [{"@type": "LocationFeatureSpecification", "name": a, "value": True} for a in p.get("amenities", [])],
         "containsPlace": [{"@type": "Apartment", "name": u["nombre"], "floorSize": {"@type": "QuantitativeValue", "value": u.get("m2"), "unitCode": "MTK"}} for u in p.get("tipologias", [])]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Real Estate", "item": BASE + "real-estate.html"},
            {"@type": "ListItem", "position": 3, "name": p["titulo"], "item": url}]}]}
    if p.get("datos"):
        for k, v in p["datos"]:
            if k == "Departamentos":
                ld["@graph"][0]["numberOfAccommodationUnits"] = int(v)
    title = f"{p['titulo']} · {p['zona']} | SosaGroup Real Estate"
    page_top = set_head(top, title, p.get("descripcion", ""), ld)

    main = f'''<main id="main">
    <section class="proj-hero" aria-labelledby="page-title">
      <div class="container">
        <nav class="crumbs" aria-label="Ruta de navegación">
          <a href="../index.html">Inicio</a><span aria-hidden="true">›</span><a href="../real-estate.html#explorar">Real Estate</a><span aria-hidden="true">›</span><span aria-current="page">{esc(p['titulo'])}</span>
        </nav>
        <div class="proj-hero__grid">
          <div class="proj-hero__text">
            <div class="re-card__top"><span class="re-tag re-tag--desarrollo">Desarrollo</span></div>
            <h1 id="page-title">{esc(p['titulo'])}</h1>
            <p class="rd-zone"><svg aria-hidden="true"><use href="#i-pin"/></svg>{esc(p['zona'])}</p>
            <p class="rd-price">{esc(precio)}</p>
            <p class="proj-hero__lead">{esc(p.get('descripcion', ''))}</p>
            <div class="proj-actions">
              {brochure}
              <a class="btn btn--outline" href="#contacto">Consultar por este proyecto</a>
            </div>
          </div>
          {f'<img class="proj-hero__img" src="../{esc(main_img)}" {srcset(main_img, "(max-width: 900px) 92vw, 560px")} alt="{esc(p["titulo"])}" width="560" height="700">' if main_img else ''}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="proj-info">
      <div class="container proj-body">
        <div>
          <h2 id="proj-info" class="proj-h2">El proyecto</h2>
          <p class="proj-desc">{esc(p.get('descripcionLarga') or p.get('descripcion', ''))}</p>
          <dl class="rd-facts">{facts_html}</dl>
          {f'<h2 class="proj-h2">Tipologías</h2><div class="rd-table"><table><thead><tr><th>Unidad</th><th>Superficie</th><th>Precio</th></tr></thead><tbody>{tip_rows}</tbody></table></div>' if tip_rows else ''}
          {f'<h2 class="proj-h2">Amenities</h2><ul class="rd-chips">{amen}</ul>' if amen else ''}
        </div>
        <aside class="proj-side">
          <h2 class="proj-h2">Ubicación</h2>
          <iframe class="proj-map" src="{gembed}" title="Mapa de ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
          <div class="proj-map-actions">
            <a class="btn btn--primary btn--block" href="{street}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-eye"/></svg>Ver la calle (Street View)</a>
            <a class="btn btn--outline btn--block" href="{gmaps}" target="_blank" rel="noopener"><svg aria-hidden="true" style="transform:none"><use href="#i-pin"/></svg>Ver ubicación en Google Maps</a>
          </div>
          {f'<h3 class="proj-h3">Cerca de</h3><ul class="rd-near">{cerca}</ul>' if cerca else ''}
        </aside>
      </div>
    </section>

    {f'<section class="section section--warm" aria-labelledby="proj-gallery"><div class="container"><h2 id="proj-gallery" class="proj-h2">Galería</h2><div class="proj-gallery">{gallery}</div></div></section>' if gallery else ''}

{contact.replace('<input type="hidden" name="division" value="real-estate">', f'<input type="hidden" name="division" value="real-estate">\n            <input type="hidden" name="proyecto" value="{esc(p["titulo"])}">')}</main>'''
    page_bottom = scripts(bottom, ["i18n.js", "main.js"])
    # WhatsApp con el nombre del proyecto en el mensaje
    wa_old = quote("Hola Silvana, quiero hacer una consulta sobre SosaGroup Real Estate.")
    wa_new = quote(f"Hola Silvana, quiero consultar por {p['titulo']}.")
    page_bottom = page_bottom.replace(wa_old, wa_new)
    main = main.replace(wa_old, wa_new)
    return page_top + main + page_bottom


# ---------------------------------------------------------------- guía
def area_page(a, areas, top, contact, bottom):
    url = f"{BASE}guia-de-tramites/{a['slug']}.html"
    items = []
    for tr in a.get("tramites", []):
        tr = {"titulo": tr} if isinstance(tr, str) else tr
        req = "".join(f'<li><svg aria-hidden="true"><use href="#i-check"/></svg>{esc(r)}</li>' for r in tr.get("requisitos", []))
        items.append(f'''
          <article class="tramite">
            <h3>{esc(tr['titulo'])}</h3>
            {f'<p>{esc(tr["descripcion"])}</p>' if tr.get('descripcion') else ''}
            {f'<ul class="checklist">{req}</ul>' if req else ''}
            {f'<p class="tramite__plazo">Plazo estimado: {esc(tr["plazo"])}</p>' if tr.get('plazo') else ''}
            <a class="link area__cta" href="#contacto" data-motivo="{a['motivo']}">Consultar sobre este trámite <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </article>''')
    if not items:
        items.append(f'''
          <article class="tramite tramite--empty">
            <h3>Estamos preparando esta guía</h3>
            <p>Mientras tanto, cuéntenos qué trámite necesita y le indicamos los requisitos y los pasos para su caso.</p>
            <a class="btn btn--primary" href="#contacto" data-motivo="{a['motivo']}">Consultar sobre este trámite</a>
          </article>''')
    others = "".join(f'<a class="area-link" href="{o["slug"]}.html"><svg aria-hidden="true"><use href="#{o["icono"]}"/></svg>{esc(o["titulo"])}</a>' for o in areas if o["slug"] != a["slug"])
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "name": a["titulo"], "url": url, "description": a["intro"], "inLanguage": "es"},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Guía de Trámites", "item": BASE + "guia-de-tramites.html"},
            {"@type": "ListItem", "position": 3, "name": a["titulo"], "item": url}]}]}
    page_top = set_head(top, f"{a['titulo']}: trámites frecuentes | SosaGroup", a["intro"], ld)
    page_top = page_top.replace('href="../guia-de-tramites.html" aria-current="page"', 'href="../guia-de-tramites.html"')
    main = f'''<main id="main">
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <nav class="crumbs" aria-label="Ruta de navegación">
          <a href="../index.html">Inicio</a><span aria-hidden="true">›</span><a href="../guia-de-tramites.html">Guía de Trámites</a><span aria-hidden="true">›</span><span aria-current="page">{esc(a['titulo'])}</span>
        </nav>
        <span class="eyebrow">Guía de Trámites</span>
        <h1 id="page-title">{esc(a['titulo'])}</h1>
        <p class="page-hero__lead">{esc(a['intro'])}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="tramites-title">
      <div class="container">
        <div class="section-head">
          <h2 id="tramites-title">Trámites frecuentes</h2>
          <p>Los requisitos concretos dependen de cada caso y se confirman en la entrevista.</p>
        </div>
        <div class="tramites">{''.join(items)}
        </div>
        <nav class="area-nav" aria-label="Otras áreas">
          <h2 class="proj-h3">Otras áreas de la guía</h2>
          <div class="area-nav__links">{others}</div>
        </nav>
      </div>
    </section>

{contact}</main>'''
    return page_top + main + scripts(bottom, ["i18n.js", "main.js"])


def main():
    out = []
    top, contact, bottom = shell("real-estate.html", {"main", "contacto"}, "real-estate.html")
    (ROOT / "real-estate").mkdir(exist_ok=True)
    for p in load_projects():
        f = ROOT / "real-estate" / f"{p['slug']}.html"
        f.write_text(project_page(p, top, contact, bottom), encoding="utf-8")
        out.append(f.relative_to(ROOT))
    data = json.loads((ROOT / "assets/data/guia.json").read_text(encoding="utf-8"))
    top, contact, bottom = shell("guia-de-tramites.html", {"main", "contacto", "contacto-directo"}, "index.html")
    (ROOT / "guia-de-tramites").mkdir(exist_ok=True)
    for a in data["areas"]:
        f = ROOT / "guia-de-tramites" / f"{a['slug']}.html"
        f.write_text(area_page(a, data["areas"], top, contact, bottom), encoding="utf-8")
        out.append(f.relative_to(ROOT))
    print("Páginas generadas:", *out, sep="\n  ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
