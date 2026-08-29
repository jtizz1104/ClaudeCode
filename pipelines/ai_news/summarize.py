"""Arma el resumen diario de noticias de IA a partir de los items crudos."""

from __future__ import annotations

from pipelines.common import llm

SYSTEM_PROMPT = """Sos el editor de un canal de noticias de IA en redes sociales
(YouTube, Instagram, TikTok). Tu trabajo es leer una lista cruda de noticias,
papers y posts de las últimas 24hs y elegir las más relevantes para un público
de negocios/tech que quiere estar al día sin perder tiempo.

Priorizá: lanzamientos de modelos, movidas de las grandes empresas de IA,
avances con impacto de negocio real, y papers con resultados sorprendentes.
Ignorá contenido duplicado, clickbait sin sustancia, o rumores sin fuente."""


def build_daily_digest(raw_items: list[dict], top_n: int = 5) -> dict:
    """Devuelve un digest estructurado: {date, stories: [...]}."""
    listing = "\n".join(
        f"- [{item['source']}] {item['title']} — {item['summary']} ({item['link']})"
        for item in raw_items
    )
    user_prompt = f"""Acá está la lista cruda de noticias/papers de las últimas 24hs:

{listing}

Elegí las {top_n} más relevantes y devolvé JSON con esta forma exacta:

{{
  "stories": [
    {{
      "title": "Título corto y claro en español",
      "source": "nombre de la fuente original",
      "link": "url original",
      "summary": "2-3 oraciones explicando qué pasó",
      "why_it_matters": "1-2 oraciones sobre el impacto para negocios/industria"
    }}
  ]
}}"""
    return llm.ask_json(SYSTEM_PROMPT, user_prompt)


if __name__ == "__main__":
    from pipelines.ai_news.fetch import fetch_all

    digest = build_daily_digest(fetch_all())
    for story in digest["stories"]:
        print(f"- {story['title']} ({story['source']})")
