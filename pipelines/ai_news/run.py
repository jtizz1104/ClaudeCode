"""Orquestador del pipeline de noticias de IA: fetch -> digest -> guiones.

Uso: python -m pipelines.ai_news.run
Guarda outputs en storage/ai_news/<fecha>/{digest.json, scripts.json}.
"""

from __future__ import annotations

from dotenv import load_dotenv

from pipelines.ai_news.fetch import fetch_all, load_config
from pipelines.ai_news.script_writer import write_scripts_for_digest
from pipelines.ai_news.summarize import build_daily_digest
from pipelines.common import storage


def main() -> None:
    load_dotenv()
    config = load_config()

    print("1/3 Buscando noticias de las últimas 24hs...")
    raw_items = fetch_all(config)
    print(f"    {len(raw_items)} items crudos encontrados.")

    print("2/3 Armando el resumen diario...")
    digest = build_daily_digest(raw_items, top_n=config.get("top_n_stories", 5))
    storage.save_json("ai_news", "digest.json", digest)

    print("3/3 Escribiendo guiones de shorts...")
    scripts = write_scripts_for_digest(digest)
    storage.save_json("ai_news", "scripts.json", scripts)

    out_dir = storage.output_dir("ai_news")
    print(f"Listo. {len(scripts)} guiones guardados en {out_dir}")


if __name__ == "__main__":
    main()
