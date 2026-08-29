"""Convierte cada noticia del digest diario en un guion de short (30-45s)."""

from __future__ import annotations

import os

from pipelines.common import llm

CHANNEL_HANDLE = os.environ.get("CHANNEL_HANDLE", "@codigonegocioia")

SYSTEM_PROMPT = f"""Sos guionista de shorts verticales (YouTube Shorts, Reels,
TikTok) para el canal {CHANNEL_HANDLE}, sobre noticias de IA para un público
de negocios/tech. Escribís en español rioplatense, tono directo y con
autoridad, sin relleno.

Cada guion dura 30-45 segundos hablados (~90-130 palabras). Estructura:
1. Hook (primera línea, engancha en 2 segundos)
2. Desarrollo (qué pasó, por qué importa)
3. Cierre invitando a seguir {CHANNEL_HANDLE} para el resumen de mañana

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
    result = llm.ask_json(SYSTEM_PROMPT, user_prompt)
    brand_tag = f"#{CHANNEL_HANDLE.lstrip('@')}"
    if brand_tag not in result.get("hashtags", []):
        result.setdefault("hashtags", []).append(brand_tag)
    return result


def write_scripts_for_digest(digest: dict) -> list[dict]:
    return [write_script(story) for story in digest["stories"]]
