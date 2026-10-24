"""Persistencia de outputs de los pipelines bajo storage/<pipeline>/<fecha>/."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "storage"


def output_dir(pipeline: str, run_date: date | None = None) -> Path:
    run_date = run_date or date.today()
    d = ROOT / pipeline / run_date.isoformat()
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_json(pipeline: str, filename: str, data, run_date: date | None = None) -> Path:
    path = output_dir(pipeline, run_date) / filename
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def load_json(pipeline: str, filename: str, run_date: date | None = None):
    path = output_dir(pipeline, run_date) / filename
    return json.loads(path.read_text(encoding="utf-8"))


def has_json(pipeline: str, filename: str, run_date: date | None = None) -> bool:
    return (output_dir(pipeline, run_date) / filename).exists()


def list_dates(pipeline: str) -> list[str]:
    """Fechas (YYYY-MM-DD) con outputs guardados para un pipeline, más reciente primero."""
    pipeline_dir = ROOT / pipeline
    if not pipeline_dir.exists():
        return []
    return sorted((d.name for d in pipeline_dir.iterdir() if d.is_dir()), reverse=True)


def recent_titles(pipeline: str, days: int = 7, exclude_today: bool = True) -> list[str]:
    """Títulos de guiones de los últimos `days` con datos, para que el guionista
    pueda detectar continuidad entre videos (ej. "es la tercera vez que...")."""
    dates = list_dates(pipeline)
    if exclude_today:
        dates = [d for d in dates if d != date.today().isoformat()]
    titles: list[str] = []
    for d in dates[:days]:
        if not has_json(pipeline, "scripts.json", date.fromisoformat(d)):
            continue
        scripts = load_json(pipeline, "scripts.json", date.fromisoformat(d))
        titles.extend(f"{d}: {s['title']}" for s in scripts if "title" in s)
    return titles
