"""Dashboard local para revisar el contenido generado por los pipelines antes
de subirlo a mano a YouTube/Instagram/TikTok.

Uso: uvicorn dashboard.app:app --reload
Abrir http://localhost:8000
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from pipelines.common import storage

app = FastAPI(title="Panel de contenido - @codigonegocioia")

STATIC_DIR = Path(__file__).parent / "static"
STATUS_FILENAME = "status.json"
VALID_STATUSES = {"pending", "approved", "posted"}


def _load_status(pipeline: str, date: str) -> dict:
    if storage.has_json(pipeline, STATUS_FILENAME, _parse_date(date)):
        return storage.load_json(pipeline, STATUS_FILENAME, _parse_date(date))
    return {}


def _save_status(pipeline: str, date: str, status: dict) -> None:
    storage.save_json(pipeline, STATUS_FILENAME, status, _parse_date(date))


def _parse_date(date: str):
    from datetime import date as date_cls

    return date_cls.fromisoformat(date)


def _video_url(pipeline: str, date: str, index: int) -> str | None:
    video_path = storage.output_dir(pipeline, _parse_date(date)) / "videos" / f"short_{index:02d}.mp4"
    if video_path.exists():
        return f"/media/{pipeline}/{date}/videos/short_{index:02d}.mp4"
    return None


def _build_items(pipeline: str, date: str) -> dict:
    d = _parse_date(date)
    if not storage.has_json(pipeline, "scripts.json", d):
        raise HTTPException(404, f"No hay guiones generados para {pipeline} en {date}")
    scripts = storage.load_json(pipeline, "scripts.json", d)
    status = _load_status(pipeline, date)

    if pipeline == "ai_news":
        digest = storage.load_json(pipeline, "digest.json", d)
        headline = f"Resumen de IA del {date}"
        contexts = [
            f"{s['summary']} — {s['why_it_matters']}" for s in digest["stories"]
        ]
    elif pipeline == "markets":
        report = storage.load_json(pipeline, "report.json", d)
        headline = report["headline"]
        contexts = [
            s["summary"] + (
                " Destacados: " + "; ".join(s.get("standout_tickers", []))
                if s.get("standout_tickers")
                else ""
            )
            for s in report["sectors"]
        ]
    else:
        raise HTTPException(404, f"Pipeline desconocido: {pipeline}")

    items = []
    for i, script in enumerate(scripts):
        items.append(
            {
                "index": i,
                "title": script["title"],
                "context": contexts[i] if i < len(contexts) else "",
                "narration": script["narration"],
                "on_screen_text": script.get("on_screen_text", []),
                "hashtags": script.get("hashtags", []),
                "video_url": _video_url(pipeline, date, i),
                "status": status.get(str(i), "pending"),
            }
        )
    return {"pipeline": pipeline, "date": date, "headline": headline, "items": items}


class StatusUpdate(BaseModel):
    status: str


@app.get("/api/pipelines")
def list_pipelines() -> dict:
    return {
        "ai_news": storage.list_dates("ai_news"),
        "markets": storage.list_dates("markets"),
    }


@app.get("/api/content/{pipeline}/{date}")
def get_content(pipeline: str, date: str) -> dict:
    return _build_items(pipeline, date)


@app.post("/api/content/{pipeline}/{date}/{index}/status")
def set_status(pipeline: str, date: str, index: int, body: StatusUpdate) -> dict:
    if body.status not in VALID_STATUSES:
        raise HTTPException(400, f"Estado inválido: {body.status!r}")
    status = _load_status(pipeline, date)
    status[str(index)] = body.status
    _save_status(pipeline, date, status)
    return {"index": index, "status": body.status}


app.mount("/media", StaticFiles(directory=str(storage.ROOT)), name="media")
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
