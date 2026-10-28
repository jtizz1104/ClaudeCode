"""Arma el informe diario de mercados a partir de los snapshots por sector."""

from __future__ import annotations

from pipelines.common import llm

SYSTEM_PROMPT = """Sos analista financiero de un canal de negocios/inversión en
redes sociales (YouTube, Instagram, TikTok). Recibís datos crudos de precios
por sector (semiconductores, infraestructura, energía limpia, energía
convencional, nuclear) y armás un informe diario claro para un público que
sigue estos sectores pero no es trader profesional.

Explicá el "por qué" detrás de los movimientos cuando sea inferible del
contexto (earnings, anuncios, macro, regulación), y marcá claramente cuando
no tengas certeza de la causa. No inventes catalizadores específicos que no
puedas justificar; en ese caso describí el movimiento sin atribuir causa."""


def build_daily_report(sector_snapshots: list[dict]) -> dict:
    """Devuelve un informe estructurado: {date, sectors: [...], headline}."""
    lines = []
    for sector in sector_snapshots:
        etf = sector["etf"]
        etf_line = f"ETF {etf['symbol']}: {etf['change_pct']:+.2f}%" if etf else "sin ETF"
        lines.append(f"\n{sector['label']} ({etf_line})")
        for t in sector["tickers"]:
            flag = " [MOVIMIENTO RELEVANTE]" if t["significant"] else ""
            lines.append(f"  {t['symbol']}: {t['change_pct']:+.2f}%, cierre ${t['close']}{flag}")
    data_block = "\n".join(lines)

    user_prompt = f"""Datos de hoy por sector:
{data_block}

Devolvé JSON con esta forma exacta:

{{
  "headline": "1 oración resumiendo el día en estos sectores",
  "sectors": [
    {{
      "sector": "nombre del sector",
      "summary": "2-3 oraciones sobre cómo le fue al sector hoy y por qué (si es inferible)",
      "standout_tickers": ["SYMBOL: explicación breve de su movimiento", "..."]
    }}
  ]
}}"""
    return llm.ask_json(SYSTEM_PROMPT, user_prompt)


if __name__ == "__main__":
    from pipelines.markets.fetch import fetch_all

    report = build_daily_report(fetch_all())
    print(report["headline"])
