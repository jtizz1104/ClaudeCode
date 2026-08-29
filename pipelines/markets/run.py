"""Orquestador del pipeline de mercados: fetch -> informe -> guiones.

Uso: python -m pipelines.markets.run
Guarda outputs en storage/markets/<fecha>/{report.json, scripts.json}.
"""

from __future__ import annotations

from dotenv import load_dotenv

from pipelines.common import storage
from pipelines.markets.analyze import build_daily_report
from pipelines.markets.fetch import fetch_all, load_config
from pipelines.markets.script_writer import write_scripts_for_report


def main() -> None:
    load_dotenv()
    config = load_config()

    print("1/3 Trayendo datos de mercado por sector...")
    snapshots = fetch_all(config)

    print("2/3 Armando el informe diario...")
    report = build_daily_report(snapshots)
    storage.save_json("markets", "report.json", report)

    print("3/3 Escribiendo guiones de shorts por sector...")
    scripts = write_scripts_for_report(report)
    storage.save_json("markets", "scripts.json", scripts)

    out_dir = storage.output_dir("markets")
    print(f"Listo. {len(scripts)} guiones guardados en {out_dir}")


if __name__ == "__main__":
    main()
