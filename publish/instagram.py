"""Publicación de Reels en Instagram vía la Graph API de Meta.

Setup (una sola vez):
1. Tu cuenta de Instagram tiene que ser Business o Creator, vinculada a una
   Página de Facebook.
2. Crear una app en https://developers.facebook.com/apps
3. Agregar el producto "Instagram Graph API" y pedir los permisos
   instagram_content_publish e instagram_basic.
4. Generar un token de acceso de larga duración para esa app+página y
   obtener el IG_BUSINESS_ACCOUNT_ID (el "Instagram User ID" de la cuenta).
5. Completar META_APP_ID, META_APP_SECRET, IG_BUSINESS_ACCOUNT_ID e
   IG_ACCESS_TOKEN en .env.

Limitación importante: la Graph API NO acepta un archivo local directo, el
video tiene que estar accesible por una URL pública (subilo a algún storage
tipo S3/Cloud Storage antes de llamar a upload_reel()).

Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
"""

from __future__ import annotations

import os
import time

import requests

GRAPH_BASE = "https://graph.facebook.com/v19.0"


def upload_reel(video_url: str, caption: str) -> str:
    """Publica un Reel a partir de una URL pública de video. Devuelve el media_id."""
    account_id = os.environ["IG_BUSINESS_ACCOUNT_ID"]
    token = os.environ["IG_ACCESS_TOKEN"]

    create_resp = requests.post(
        f"{GRAPH_BASE}/{account_id}/media",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "access_token": token,
        },
        timeout=30,
    )
    create_resp.raise_for_status()
    creation_id = create_resp.json()["id"]

    # El procesamiento del video es asíncrono: hay que hacer polling del status.
    for _ in range(30):
        status_resp = requests.get(
            f"{GRAPH_BASE}/{creation_id}",
            params={"fields": "status_code", "access_token": token},
            timeout=15,
        )
        status_resp.raise_for_status()
        if status_resp.json().get("status_code") == "FINISHED":
            break
        time.sleep(10)
    else:
        raise TimeoutError("Instagram no terminó de procesar el video a tiempo")

    publish_resp = requests.post(
        f"{GRAPH_BASE}/{account_id}/media_publish",
        data={"creation_id": creation_id, "access_token": token},
        timeout=30,
    )
    publish_resp.raise_for_status()
    return publish_resp.json()["id"]
