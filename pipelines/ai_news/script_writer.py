"""Convierte cada noticia del digest diario en un guion de short (30-45s)."""

from __future__ import annotations

from pipelines.common import llm

SYSTEM_PROMPT = """Sos guionista de shorts verticales (YouTube Shorts, Reels,
TikTok) sobre noticias de IA para un canal de negocios/tech. Escribís en
español rioplatense, tono directo y con autoridad, sin relleno.

Cada guion dura 30-45 segundos hablados (~90-130 palabras). Estructura:
1. Hook (primera línea, engancha en 2 segundos)
2. Desarrollo (qué pasó, por qué importa)
3. Cierre con gancho para el siguiente short o para seguir el canal

Además de la narración, indicá "on_screen_text": una lista de 3-5 frases
cortas que aparecen como texto animado en pantalla, sincronizadas con los
puntos clave del guion."""


def write_script(story: dict) -> dict:
    """Genera el guion de un short a partir de una noticia del digest."""
    user_prompt = f"""Noticia:
Título: {story['title']}
Fuente: {story['source']}
Resumen: {story['summary']}
Por qué importa: {story['why_it_matters']}

Devolvé JSON con esta forma exacta:

{{
  "title": "título corto para el video (para YouTube/IG/TikTok)",
  "narration": "el guion completo, listo para locutar",
  "on_screen_text": ["frase 1", "frase 2", "frase 3"],
  "hashtags": ["#IA", "#hashtag2", "#hashtag3"]
}}"""
    return llm.ask_json(SYSTEM_PROMPT, user_prompt)


def write_scripts_for_digest(digest: dict) -> list[dict]:
    return [write_script(story) for story in digest["stories"]]
