"""Publicación en TikTok vía la Content Posting API.

Setup (una sola vez):
1. Crear una app en https://developers.tiktok.com/
2. Pedir acceso al "Content Posting API" (requiere revisión manual de
   TikTok, puede tardar días/semanas en aprobarse).
3. Una vez aprobada, implementar el flujo OAuth para obtener un
   TIKTOK_ACCESS_TOKEN de la cuenta del canal.
4. Completar TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET y TIKTOK_ACCESS_TOKEN
   en .env.

Esta implementación usa el flujo de subida por chunks recomendado por
TikTok (PULL_FROM_URL no siempre está habilitado para apps nuevas, así que
acá se sube el archivo local directamente vía FILE_UPLOAD).

Docs: https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
"""

from __future__ import annotations

import os
from pathlib import Path

import requests

API_BASE = "https://open.tiktokapis.com/v2"


class TikTokAPIError(RuntimeError):
    """Error seguro de la API de TikTok, sin tokens ni credenciales."""

    def __init__(
        self,
        operation: str,
        status_code: int,
        *,
        code: str = "unknown_error",
        message: str = "TikTok rechazó la solicitud",
        log_id: str = "",
    ) -> None:
        self.operation = operation
        self.status_code = status_code
        self.code = code
        self.message = message
        self.log_id = log_id
        detail = f"TikTok {operation}: {code} — {message}"
        if log_id:
            detail += f" (log_id: {log_id})"
        super().__init__(detail)


def _raise_tiktok_error(response: requests.Response, operation: str) -> None:
    """Extrae solamente los campos de error documentados por TikTok."""
    if response.ok:
        return
    try:
        error = response.json().get("error", {})
    except (requests.JSONDecodeError, ValueError):
        error = {}
    raise TikTokAPIError(
        operation,
        response.status_code,
        code=str(error.get("code") or "http_error"),
        message=str(error.get("message") or response.reason or "Solicitud rechazada"),
        log_id=str(error.get("log_id") or ""),
    )


def upload_video(
    video_path: str,
    caption: str,
    *,
    access_token: str | None = None,
    privacy_level: str = "SELF_ONLY",
    disable_duet: bool = True,
    disable_comment: bool = False,
    disable_stitch: bool = True,
) -> str:
    """Sube un video a TikTok como borrador/publicación directa según los
    permisos de la app. Devuelve el publish_id."""
    token = access_token or os.environ["TIKTOK_ACCESS_TOKEN"]
    video_path = Path(video_path)
    video_size = video_path.stat().st_size

    init_resp = requests.post(
        f"{API_BASE}/post/publish/video/init/",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "post_info": {
                "title": caption,
                "privacy_level": privacy_level,
                "disable_duet": disable_duet,
                "disable_comment": disable_comment,
                "disable_stitch": disable_stitch,
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": video_size,
                "chunk_size": video_size,
                "total_chunk_count": 1,
            },
        },
        timeout=30,
    )
    _raise_tiktok_error(init_resp, "video/init")
    data = init_resp.json()["data"]
    publish_id = data["publish_id"]
    upload_url = data["upload_url"]

    with open(video_path, "rb") as f:
        put_resp = requests.put(
            upload_url,
            headers={
                "Content-Type": "video/mp4",
                "Content-Range": f"bytes 0-{video_size - 1}/{video_size}",
            },
            data=f,
            timeout=120,
        )
    _raise_tiktok_error(put_resp, "video/upload")

    return publish_id
