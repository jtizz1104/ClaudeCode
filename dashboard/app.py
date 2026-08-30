"""Dashboard local para revisar el contenido generado por los pipelines antes
de subirlo a mano a YouTube/Instagram/TikTok.

Uso: uvicorn dashboard.app:app --reload
Abrir http://localhost:8000
"""

from __future__ import annotations

import base64
import os
import secrets
import tempfile
from pathlib import Path
from urllib.parse import urlencode

import requests
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from pipelines.common import storage
from publish.tiktok import TikTokAPIError, upload_video

app = FastAPI(title="Panel de contenido - @codigonegocioia")

STATIC_DIR = Path(__file__).parent / "static"
PUBLIC_DIR = Path(__file__).parent / "public"
STATUS_FILENAME = "status.json"
VALID_STATUSES = {"pending", "approved", "posted"}


@app.middleware("http")
async def protect_dashboard(request: Request, call_next):
    """Protect private dashboard, API and generated media with HTTP Basic auth."""
    protected = ("/dashboard", "/api", "/media", "/auth/tiktok/login", "/auth/tiktok/status")
    if not request.url.path.startswith(protected):
        return await call_next(request)

    expected_user = os.getenv("DASHBOARD_USERNAME", "admin")
    expected_password = os.getenv("DASHBOARD_PASSWORD")
    if not expected_password:
        return JSONResponse(
            {"detail": "Dashboard access is not configured"}, status_code=503
        )

    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Basic "):
        try:
            raw = base64.b64decode(authorization[6:]).decode("utf-8")
            username, password = raw.split(":", 1)
        except (ValueError, UnicodeDecodeError):
            username, password = "", ""
        if secrets.compare_digest(username, expected_user) and secrets.compare_digest(
            password, expected_password
        ):
            return await call_next(request)

    return Response(
        status_code=401,
        headers={"WWW-Authenticate": 'Basic realm="Codigo Negocio IA"'},
    )


@app.get("/auth/tiktok/login", include_in_schema=False)
def tiktok_login() -> RedirectResponse:
    """Start TikTok OAuth without exposing the client secret to the browser."""
    client_key = os.getenv("TIKTOK_CLIENT_KEY")
    redirect_uri = os.getenv(
        "TIKTOK_REDIRECT_URI",
        "https://codigo-negocio-ia.onrender.com/auth/tiktok/callback",
    )
    if not client_key:
        raise HTTPException(503, "TikTok OAuth is not configured")

    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_key": client_key,
            "response_type": "code",
            "scope": "user.info.basic,video.upload,video.publish",
            "redirect_uri": redirect_uri,
            "state": state,
        }
    )
    response = RedirectResponse(f"https://www.tiktok.com/v2/auth/authorize/?{query}")
    response.set_cookie(
        "tiktok_oauth_state",
        state,
        max_age=600,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return response


@app.get("/auth/tiktok/callback", include_in_schema=False)
def tiktok_callback(request: Request, code: str | None = None, state: str | None = None) -> HTMLResponse:
    """Exchange TikTok's authorization code and retain the token for the demo session."""
    expected_state = request.cookies.get("tiktok_oauth_state")
    if not code or not state or not expected_state or not secrets.compare_digest(state, expected_state):
        raise HTTPException(400, "Invalid TikTok OAuth response")

    client_key = os.getenv("TIKTOK_CLIENT_KEY")
    client_secret = os.getenv("TIKTOK_CLIENT_SECRET")
    redirect_uri = os.getenv(
        "TIKTOK_REDIRECT_URI",
        "https://codigo-negocio-ia.onrender.com/auth/tiktok/callback",
    )
    if not client_key or not client_secret:
        raise HTTPException(503, "TikTok OAuth is not configured")

    token_response = requests.post(
        "https://open.tiktokapis.com/v2/oauth/token/",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_key": client_key,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        timeout=30,
    )
    if not token_response.ok:
        raise HTTPException(502, "TikTok did not complete the token exchange")

    token_data = token_response.json()
    storage.save_json("tiktok", "oauth.json", token_data)
    response = HTMLResponse(
        """<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><title>TikTok conectado</title>
        <body style=\"font-family:system-ui;background:#070d27;color:#fff;padding:4rem\">
        <h1>TikTok conectado correctamente</h1><p>La cuenta autorizada ya puede usarse en la demostración privada.</p>
        <p><a style=\"color:#a987ff\" href=\"/dashboard/\">Volver al dashboard</a></p></body></html>"""
    )
    response.delete_cookie("tiktok_oauth_state")
    return response


@app.get("/auth/tiktok/status", include_in_schema=False)
def tiktok_status() -> dict:
    connected = storage.has_json("tiktok", "oauth.json")
    return {"connected": connected}


def _tiktok_token() -> str:
    if not storage.has_json("tiktok", "oauth.json"):
        raise HTTPException(401, "TikTok account is not connected")
    token_data = storage.load_json("tiktok", "oauth.json")
    token = token_data.get("access_token")
    if not token:
        raise HTTPException(401, "TikTok access token is unavailable")
    return token


@app.get("/api/tiktok/creator-info")
def tiktok_creator_info() -> dict:
    response = requests.post(
        "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
        headers={"Authorization": f"Bearer {_tiktok_token()}", "Content-Type": "application/json"},
        json={},
        timeout=30,
    )
    if not response.ok:
        raise HTTPException(502, "TikTok did not return creator information")
    return response.json()


@app.post("/api/tiktok/publish")
def tiktok_publish(
    video: UploadFile = File(...),
    caption: str = Form(""),
    privacy_level: str = Form("SELF_ONLY"),
    allow_comments: bool = Form(False),
) -> dict:
    if video.content_type not in {"video/mp4", "application/octet-stream"}:
        raise HTTPException(400, "Only MP4 videos are accepted")
    if privacy_level != "SELF_ONLY":
        raise HTTPException(400, "Sandbox publications must remain private")

    suffix = Path(video.filename or "video.mp4").suffix.lower()
    if suffix != ".mp4":
        raise HTTPException(400, "The video filename must end in .mp4")

    with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
        while chunk := video.file.read(1024 * 1024):
            tmp.write(chunk)
        tmp.flush()
        try:
            publish_id = upload_video(
                tmp.name,
                caption[:2200],
                access_token=_tiktok_token(),
                privacy_level="SELF_ONLY",
                disable_comment=not allow_comments,
                disable_duet=True,
                disable_stitch=True,
            )
        except TikTokAPIError as exc:
            # El detalle contiene únicamente code/message/log_id; nunca el token.
            print(f"TikTok API error: {exc}", flush=True)
            raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"publish_id": publish_id, "privacy_level": "SELF_ONLY"}


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


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/privacy", include_in_schema=False)
def privacy_policy() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "privacy.html")


@app.get("/terms", include_in_schema=False)
def terms_of_service() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "terms.html")


app.mount("/media", StaticFiles(directory=str(storage.ROOT)), name="media")
app.mount("/dashboard", StaticFiles(directory=str(STATIC_DIR), html=True), name="dashboard")
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="public")
