#!/usr/bin/env python3
"""Genera las páginas en inglés (en/) y portugués (pt/) del sitio SosaGroup.

Las páginas en castellano (index.html, real-estate.html) son la fuente. Este
script las traduce con assets/i18n-dict.js y escribe:

  en/index.html, en/real-estate.html
  pt/index.html, pt/real-estate.html
  sitemap.xml

También actualiza en las seis páginas el bloque SEO (canonical, hreflang,
Open Graph) y los enlaces del selector de idioma.

Uso (desde la carpeta sosagroup/):  python3 tools/build_i18n.py
Ejecutarlo cada vez que se cambie el HTML en castellano o el diccionario.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://sosagroup.com.py/"           # dominio público del sitio
PAGES = {"index.html": "", "real-estate.html": "real-estate.html", "guia-de-tramites.html": "guia-de-tramites.html",
         "privacidad.html": "privacidad.html"}   # archivo -> ruta pública
# Páginas generadas por tools/build_pages.py (proyectos y áreas de la guía), en subcarpetas
for _sub in ("real-estate", "guia-de-tramites"):
    for _f in sorted((Path(__file__).resolve().parent.parent / _sub).glob("*.html")):
        PAGES[f"{_sub}/{_f.name}"] = f"{_sub}/{_f.name}"
LANGS = ["es", "en", "pt"]
OG_LOCALE = {"es": "es_PY", "en": "en_US", "pt": "pt_BR"}
SKIP_TAGS = ("script", "style", "svg", "textarea")
ATTRS = ("placeholder", "aria-label", "alt", "title", "content")
LETTERS = re.compile(r"[^\W\d_]")
TOKENS = re.compile(r"(<!--.*?-->|<[^>]+>)", re.S)
# Textos que no se traducen (nombres propios, siglas); no se informan como faltantes
KEEP = {"Home Stay San Martín", "Matrisa Lillo", "MATRISA", "P&H Urban Development", "S", "Sosa", "Group", "SosaGroup", "SosaGroup Real Estate", "Real Estate", "ES", "EN", "PT", "Español", "English",
        "Português", "WhatsApp", "Gloria Sosa", "Lic. Gloria Sosa", "Silvana Gimenez", "Valeria Gimenez", "Sulma Paredes",
        "Gloria Sosa & Asociadas", "Miguel Misenta", "· Argentina", "Arturo Arámburo", "Ruth Sosa", "Oliveira Oliveira",
        "JLuis RL", "Ale Calello", "AA", "AC", "JL", "OO", "RS", "SG", "Aviadores del Chaco 2050", "San Bernardino", "info@sosagroup.com.py"}
META_CONTENT = re.compile(r'(name="description"|property="og:(title|description)")')


def load_dict():
    src = (ROOT / "assets/i18n-dict.js").read_text(encoding="utf-8")
    return json.loads(src[src.index("=") + 1:].strip().rstrip(";"))


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def url(lang, page):
    return BASE + ("" if lang == "es" else lang + "/") + PAGES[page]


def rel(from_lang, to_lang, page):
    """Enlace relativo entre versiones de idioma de la misma página."""
    import posixpath
    src = page if from_lang == "es" else f"{from_lang}/{page}"
    dst = page if to_lang == "es" else f"{to_lang}/{page}"
    return posixpath.relpath(dst, posixpath.dirname(src) or ".")


def seo_block(lang, page):
    lines = [f'<link rel="canonical" href="{url(lang, page)}">']
    lines += [f'<link rel="alternate" hreflang="{l}" href="{url(l, page)}">' for l in LANGS]
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{url("es", page)}">')
    lines.append(f'<meta property="og:url" content="{url(lang, page)}">')
    lines.append(f'<meta property="og:locale" content="{OG_LOCALE[lang]}">')
    lines += [f'<meta property="og:locale:alternate" content="{OG_LOCALE[l]}">' for l in LANGS if l != lang]
    return "".join(f"  {l}\n" for l in lines)


def set_seo_and_switcher(s, lang, page):
    s = re.sub(r"(  <!-- seo:start[^>]*-->\n).*?(  <!-- seo:end -->)",
               lambda m: m.group(1) + seo_block(lang, page) + m.group(2), s, flags=re.S)

    def link(m):
        tag = re.sub(r'\s+aria-current="true"', "", m.group(0))
        to = re.search(r'data-lang="(\w+)"', tag).group(1)
        tag = re.sub(r'href="[^"]*"', f'href="{rel(lang, to, page)}"', tag)
        return tag.replace("<a ", '<a aria-current="true" ', 1) if to == lang else tag

    return re.sub(r'<a data-lang="\w+"[^>]*>|<a aria-current="true" data-lang="\w+"[^>]*>', link, s)


def translate(s, lang, d, missing):
    out, skip, ld_next = [], [], False

    def tr_text(raw):
        core = raw.strip()
        if not core or not LETTERS.search(core):
            return raw
        key = norm(html.unescape(core))
        if re.fullmatch(r"[\d.,\s]+m²", key):   # superficies: 32,8 m² -> 32.8 m² en inglés
            return raw.replace(",", ".") if lang == "en" else raw
        if key in d:
            lead, trail = raw[: len(raw) - len(raw.lstrip())], raw[len(raw.rstrip()):]
            return lead + html.escape(d[key], quote=False) + trail
        if key not in KEEP:
            missing.add(key)
        return raw

    def tr_json(v):
        if isinstance(v, dict):
            return {k: (lang if k == "inLanguage" else tr_json(x)) for k, x in v.items()}
        if isinstance(v, list):
            return [tr_json(x) for x in v]
        if isinstance(v, str) and LETTERS.search(v) and not v.startswith("http"):
            if v in d:
                return d[v]
            if " " in v and v not in KEEP:
                missing.add(v)
        return v

    for tok in TOKENS.split(s):
        if tok.startswith("<!--"):
            out.append(tok)
            continue
        if tok.startswith("<"):
            name = re.match(r"</?\s*([a-zA-Z0-9]+)", tok)
            name = name.group(1).lower() if name else ""
            if tok.startswith("</"):
                if skip and skip[-1] == name:
                    skip.pop()
            elif name in SKIP_TAGS and not tok.endswith("/>"):
                skip.append(name)
                ld_next = name == "script" and "application/ld+json" in tok
            if name == "html":
                tok = re.sub(r'lang="\w+"', f'lang="{lang}"', tok)
            if not tok.startswith("</"):
                # Los recursos (assets/) son compartidos: un nivel más arriba desde /en/ y /pt/
                tok = re.sub(r'\b(src|href)="((?:\.\./)*)assets/', r'\1="../\2assets/', tok)
                tok = re.sub(r'\bsrcset="[^"]*"', lambda m: re.sub(r'(^|[",]\s*)((?:\.\./)*)assets/', r'\1../\2assets/', m.group(0)), tok)
                def attr(m):
                    v = html.unescape(m.group(2))
                    if not LETTERS.search(v) or m.group(1) == "content" and not META_CONTENT.search(tok):
                        return m.group(0)
                    if norm(v) in d:
                        return f'{m.group(1)}="{html.escape(d[norm(v)])}"'
                    if norm(v) not in KEEP:
                        missing.add(norm(v))
                    return m.group(0)
                tok = re.sub(r'\b(' + "|".join(ATTRS) + r')="([^"]*)"', attr, tok)
            out.append(tok)
            continue
        if ld_next and skip and skip[-1] == "script":
            data = tr_json(json.loads(tok))
            indent = re.match(r"\s*", tok).group(0)
            tok = indent + json.dumps(data, ensure_ascii=False, indent=2).replace("\n", "\n  ") + "\n  "
            ld_next = False
        elif not skip:
            tok = tr_text(tok)
        out.append(tok)
    return "".join(out)


def sitemap():
    rows = []
    for page in PAGES:
        alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{url(l, page)}"/>' for l in LANGS)
        alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{url("es", page)}"/>'
        for lang in LANGS:
            rows.append(f"  <url>\n    <loc>{url(lang, page)}</loc>{alts}\n  </url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + "\n".join(rows) + "\n</urlset>\n")


def main():
    dicts = load_dict()
    report = {}
    for page in PAGES:
        src_path = ROOT / page
        src = set_seo_and_switcher(src_path.read_text(encoding="utf-8"), "es", page)
        src_path.write_text(src, encoding="utf-8")
        for lang in LANGS[1:]:
            missing = set()
            out = translate(src, lang, dicts[lang], missing)
            out = set_seo_and_switcher(out, lang, page)
            # Las páginas traducidas cargan solo el diccionario de su idioma (las de castellano, ninguno)
            out = re.sub(r'(  <script src="((?:\.\./)*)assets/i18n\.js" defer></script>)',
                         rf'  <script src="\2assets/i18n-{lang}.js" defer></script>\n\1', out)
            (ROOT / lang / page).parent.mkdir(parents=True, exist_ok=True)
            (ROOT / lang / page).write_text(out, encoding="utf-8")
            report[(lang, page)] = missing
    (ROOT / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    for lang in LANGS[1:]:
        (ROOT / f"assets/i18n-{lang}.js").write_text(
            "// Generado por tools/build_i18n.py a partir de assets/i18n-dict.js (no editar a mano)\n"
            "window.SOSA_I18N = " + json.dumps({lang: dicts[lang]}, ensure_ascii=False, separators=(",", ":")) + ";\n",
            encoding="utf-8")

    for (lang, page), missing in report.items():
        print(f"{lang}/{page}: {len(missing)} frases sin traducir")
        for m in sorted(missing):
            print("   -", m[:110])
    return 0


if __name__ == "__main__":
    sys.exit(main())
