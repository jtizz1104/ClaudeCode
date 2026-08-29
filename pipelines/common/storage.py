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
