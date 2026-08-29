"""Convierte el informe diario de mercados en guiones de shorts (uno por sector)."""

from __future__ import annotations

import os

from pipelines.common import llm

CHANNEL_HANDLE = os.environ.get("CHANNEL_HANDLE", "@codigonegocioia")

SYSTEM_PROMPT = f"""Sos guionista de shorts verticales (YouTube Shorts, Reels,
TikTok) para el canal {CHANNEL_HANDLE}, sobre mercados y sectores
estratégicos (chips, infraestructura, energía limpia y convencional,
nuclear). Español rioplatense, tono de analista serio pero accesible, sin
dar recomendaciones de compra/venta explícitas (esto es informativo, no
consejo financiero).

Cada guion dura 30-45 segundos hablados (~90-130 palabras). Estructura:
1. Hook con el dato más llamativo del sector
2. Contexto: qué pasó y por qué importa
3. Cierre invitando a seguir {CHANNEL_HANDLE} para el informe de mañana

Además, indicá "on_screen_text": 3-5 frases cortas con los números clave
(tickers y %) para mostrar como texto/gráfico animado en pantalla."""


def write_sector_script(sector_report: dict) -> dict:
    user_prompt = f"""Sector: {sector_report['sector']}
Resumen: {sector_report['summary']}
Tickers destacados: {"; ".join(sector_report.get('standout_tickers', []))}

Devolvé JSON con esta forma exacta:

{{
  "title": "título corto para el video",
  "narration": "el guion completo, listo para locutar",
  "on_screen_text": ["frase 1", "frase 2", "frase 3"],
  "hashtags": ["#Mercados", "#hashtag2", "#hashtag3"]
}}"""
    result = llm.ask_json(SYSTEM_PROMPT, user_prompt)
    brand_tag = f"#{CHANNEL_HANDLE.lstrip('@')}"
    if brand_tag not in result.get("hashtags", []):
        result.setdefault("hashtags", []).append(brand_tag)
    return result


def write_scripts_for_report(report: dict) -> list[dict]:
    return [write_sector_script(sector) for sector in report["sectors"]]
