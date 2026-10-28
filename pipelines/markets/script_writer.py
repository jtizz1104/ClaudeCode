"""Convierte el informe diario de mercados en guiones de shorts (uno por
sector), en el formato real de producción del canal: guion numerado tipo
"beat" (no un párrafo narrado), tabla de b-roll, nota de contraste visual,
regla de disclaimer y continuidad entre días."""

from __future__ import annotations

import os

from pipelines.common import llm
from pipelines.common.caption_rules import PLATFORM_CAPTION_RULES

CHANNEL_HANDLE = os.environ.get("CHANNEL_HANDLE", "@codigonegocioia")

SYSTEM_PROMPT = f"""Sos guionista de shorts verticales (YouTube Shorts, Reels,
TikTok) para el canal {CHANNEL_HANDLE}, sobre mercados y sectores
estratégicos (chips, infraestructura, energía limpia y convencional,
nuclear). Español rioplatense, tono analítico y escéptico ("datos, contexto
y preguntas incómodas"), sin dar recomendaciones de compra/venta explícitas
(esto es informativo, no consejo financiero).

FORMATO REAL DE PRODUCCIÓN (no un párrafo narrado — un guion "beat"):

- 9-14 líneas cortas y numeradas, cada una casi un corte de edición
  distinto. Nada de oraciones largas: una idea por línea.
- Línea 1 = el hook. Tiene que entregar el dato/contradicción más fuerte
  DE ENTRADA (ej. una acción que sube por una razón inesperada, un
  contraste entre resultados buenos y reacción negativa del mercado), no
  prepararlo con contexto genérico primero.
- Desarrollo: cifras concretas (tickers, %, montos) citadas con fuente.
- Última línea = siempre una pregunta reflexiva abierta al espectador
  (nunca una conclusión cerrada, nunca un CTA de compra/venta).
- Como el guion menciona tickers/acciones específicas, SIEMPRE incluí una
  línea de disclaimer cerca del cierre ("no es recomendación de inversión"
  / "esto no es consejo financiero" / "es contexto de mercado, no una
  recomendación" — alterná la redacción, nunca la misma frase dos guiones
  seguidos).

Además del guion, generá:
- "broll": una lista de objetos {{"lines": "1-3", "visual": "...",
  "on_screen_source": "Sí — nombre de la fuente" o null}} que cubra todas
  las líneas, agrupadas por rango cuando comparten el mismo recurso visual.
- "visual_contrast_note": una frase que describa el contraste/paradoja
  central del video (qué par de ideas conviene mostrar en corte/split
  para que el giro se sienta visualmente, no solo se diga).
- "disclaimer_included": true (siempre, en este pipeline, salvo que el
  guion no mencione ningún ticker puntual).

Si en "temas_recientes" hay una noticia relacionada con esta (mismo
sector, misma empresa, parte de una tendencia que ya se cubrió — ej. una
tercera planta nuclear que reabre este mes), marcá la continuidad
explícitamente en el guion — es un diferenciador del canal.

{PLATFORM_CAPTION_RULES}"""


def write_sector_script(sector_report: dict, recent_titles: list[str] | None = None) -> dict:
    temas_recientes = "\n".join(recent_titles or []) or "(sin datos de días anteriores)"
    user_prompt = f"""Sector: {sector_report['sector']}
Resumen: {sector_report['summary']}
Tickers destacados: {"; ".join(sector_report.get('standout_tickers', []))}

Temas recientes del canal (para detectar continuidad):
{temas_recientes}

Devolvé JSON con esta forma exacta:

{{
  "title": "título corto para el video",
  "lines": ["línea 1 (hook)", "línea 2", "línea 3", "...hasta 9-14 líneas", "última línea: pregunta al espectador"],
  "broll": [
    {{"lines": "1-3", "visual": "descripción del recurso visual", "on_screen_source": "Sí — fuente" }},
    {{"lines": "4", "visual": "...", "on_screen_source": null}}
  ],
  "visual_contrast_note": "la paradoja/contraste central del video",
  "disclaimer_included": true,
  "hashtags": ["#Mercados", "#hashtag2", "#hashtag3"],
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


def write_scripts_for_report(report: dict, recent_titles: list[str] | None = None) -> list[dict]:
    return [write_sector_script(sector, recent_titles) for sector in report["sectors"]]
