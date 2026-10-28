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


def upload_video(video_path: str, caption: str) -> str:
    """Sube un video a TikTok como borrador/publicación directa según los
    permisos de la app. Devuelve el publish_id."""
    token = os.environ["TIKTOK_ACCESS_TOKEN"]
    video_path = Path(video_path)
    video_size = video_path.stat().st_size

    init_resp = requests.post(
        f"{API_BASE}/post/publish/video/init/",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "post_info": {
                "title": caption,
                "privacy_level": "SELF_ONLY",  # cambiar a PUBLIC_TO_EVERYONE cuando esté validado
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False,
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
    init_resp.raise_for_status()
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
    put_resp.raise_for_status()

    return publish_id
