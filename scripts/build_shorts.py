"""Renderiza en video todos los guiones generados por un pipeline.

Uso:
    python scripts/build_shorts.py ai_news
    python scripts/build_shorts.py markets
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

from pipelines.common import storage
from render.video_builder import build_short


def main(pipeline: str) -> None:
    load_dotenv()
    scripts = storage.load_json(pipeline, "scripts.json")
    out_dir = storage.output_dir(pipeline) / "videos"
    out_dir.mkdir(exist_ok=True)
    for i, script in enumerate(scripts):
        out_path = out_dir / f"short_{i:02d}.mp4"
        print(f"Renderizando: {script['title']} -> {out_path}")
        build_short(script, out_path)
    print(f"Listo. {len(scripts)} videos en {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ("ai_news", "markets"):
        print("Uso: python scripts/build_shorts.py [ai_news|markets]")
        sys.exit(1)
    main(sys.argv[1])
