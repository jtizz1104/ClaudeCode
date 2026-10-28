"""Convierte cada noticia del digest diario en un guion de short (42-48s),
en el formato real de producción del canal: guion numerado tipo "beat"
(no un párrafo narrado), tabla de b-roll, nota de contraste visual, regla
de disclaimer y continuidad entre días."""

from __future__ import annotations

import os

from pipelines.common import llm
from pipelines.common.caption_rules import PLATFORM_CAPTION_RULES

CHANNEL_HANDLE = os.environ.get("CHANNEL_HANDLE", "@codigonegocioia")

SYSTEM_PROMPT = f"""Sos guionista de shorts verticales (YouTube Shorts, Reels,
TikTok) para el canal {CHANNEL_HANDLE}, sobre noticias de IA para un público
de negocios/tech. Escribís en español rioplatense, tono directo, analítico
y escéptico ("datos, contexto y preguntas incómodas" — la marca cuestiona
el hype en vez de repetirlo). Sin relleno, sin jerga de finfluencer.

FORMATO REAL DE PRODUCCIÓN (no un párrafo narrado — un guion "beat"):

- 9-14 líneas cortas y numeradas, cada una casi un corte de edición
  distinto. Nada de oraciones largas: una idea por línea.
- Línea 1 = el hook. Tiene que entregar la tensión/contradicción/dato
  sorprendente DE ENTRADA, no prepararlo. Si el giro más fuerte de la
  noticia aparece recién a mitad del guion, hay que adelantarlo a la
  línea 1 (aunque se repita o se reformule más abajo).
- Desarrollo: 1-2 cifras duras con fuente citable por línea, nunca una
  afirmación sin sustento.
- Última línea = siempre una pregunta reflexiva abierta al espectador
  (nunca una conclusión cerrada, nunca un CTA de venta).
- Si la noticia menciona una acción/ticker específico (ej. una empresa
  cuya cotización se movió por la noticia), incluí una línea de disclaimer
  cerca del cierre ("no es recomendación de inversión" / "esto no es
  consejo financiero" / "es contexto, no una recomendación" — alterná la
  redacción, nunca la misma frase dos guiones seguidos).

Además del guion, generá:
- "broll": una lista de objetos {{"lines": "1-3", "visual": "...",
  "on_screen_source": "Sí — nombre de la fuente" o null}} que cubra todas
  las líneas, agrupadas por rango cuando comparten el mismo recurso visual.
- "visual_contrast_note": una frase que describa el contraste/paradoja
  central del video (qué par de ideas conviene mostrar en corte/split
  para que el giro se sienta visualmente, no solo se diga).
- "disclaimer_included": true/false según si el guion menciona una
  acción/ticker específico y por lo tanto necesita la línea de disclaimer.

Si en "temas_recientes" hay una noticia relacionada con esta (mismo tema,
misma empresa, parte de una tendencia que ya se cubrió), marcá la
continuidad explícitamente en el guion (ej. "es la tercera vez este mes
que...") — es un diferenciador del canal frente a la competencia.

{PLATFORM_CAPTION_RULES}"""


def write_script(story: dict, recent_titles: list[str] | None = None) -> dict:
    """Genera el guion de un short a partir de una noticia del digest."""
    temas_recientes = "\n".join(recent_titles or []) or "(sin datos de días anteriores)"
    user_prompt = f"""Noticia:
Título: {story['title']}
Fuente: {story['source']}
Resumen: {story['summary']}
Por qué importa: {story['why_it_matters']}

Temas recientes del canal (para detectar continuidad):
{temas_recientes}

Devolvé JSON con esta forma exacta:

{{
  "title": "título corto para el video (para YouTube/IG/TikTok)",
  "lines": ["línea 1 (hook)", "línea 2", "línea 3", "...hasta 9-14 líneas", "última línea: pregunta al espectador"],
  "broll": [
    {{"lines": "1-3", "visual": "descripción del recurso visual", "on_screen_source": "Sí — fuente" }},
    {{"lines": "4", "visual": "...", "on_screen_source": null}}
  ],
  "visual_contrast_note": "la paradoja/contraste central del video",
  "disclaimer_included": false,
  "hashtags": ["#IA", "#hashtag2", "#hashtag3"],
  "captions": {{
    "instagram": "caption de Reel lista para pegar (hook + payoff + CTA + 3-10 hashtags)",
    "tiktok": "caption de TikTok lista para pegar (hook + 3-5 hashtags, bajo 150 caracteres)",
    "youtube": "título (60-70 caracteres) + descripción corta de Short con #shorts"
  }}
}}"""
    result = llm.ask_json(SYSTEM_PROMPT, user_prompt)
    brand_tag = f"#{CHANNEL_HANDLE.lstrip('@')}"
    if brand_tag not in result.get("hashtags", []):
        result.setdefault("hashtags", []).append(brand_tag)
    return result


def write_scripts_for_digest(digest: dict, recent_titles: list[str] | None = None) -> list[dict]:
    return [write_script(story, recent_titles) for story in digest["stories"]]
