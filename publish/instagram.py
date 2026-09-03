"""Publicación de Reels con Instagram API e Instagram Login.

Usa un Instagram User access token con ``instagram_business_basic`` e
``instagram_business_content_publish``. El video debe permanecer disponible
mediante una URL HTTPS pública mientras Meta crea y procesa el contenedor.
"""

from __future__ import annotations

import os
import time

import requests


class InstagramAPIError(RuntimeError):
    """Error seguro para mostrar sin incluir credenciales ni URLs privadas."""


def _graph_base() -> str:
    version = os.getenv("INSTAGRAM_API_VERSION", "v23.0").strip("/")
    return f"https://graph.instagram.com/{version}"


def _credentials() -> tuple[str, str]:
    token = os.getenv("IG_ACCESS_TOKEN")
    account_id = os.getenv("IG_BUSINESS_ACCOUNT_ID")
    if not token or not account_id:
        raise InstagramAPIError("Instagram no está configurado en el servidor")
    return token, account_id


def _error(response: requests.Response, action: str) -> InstagramAPIError:
    try:
        api_error = response.json().get("error", {})
        message = api_error.get("message", "respuesta no válida")
        code = api_error.get("code")
        suffix = f" (código {code})" if code is not None else ""
    except (AttributeError, TypeError, ValueError):
        message, suffix = "respuesta no válida", ""
    return InstagramAPIError(f"Instagram rechazó {action}: {message}{suffix}")


def account_info() -> dict:
    """Comprueba el token y devuelve únicamente datos públicos de la cuenta."""
    token, account_id = _credentials()
    response = requests.get(
        f"{_graph_base()}/{account_id}",
        headers={"Authorization": f"Bearer {token}"},
        params={"fields": "id,username"},
        timeout=20,
    )
    if not response.ok:
        raise _error(response, "la verificación de la cuenta")
    return response.json()


def upload_reel(video_url: str, caption: str) -> str:
    """Publica un Reel desde una URL HTTPS y devuelve el ID publicado."""
    token, account_id = _credentials()
    headers = {"Authorization": f"Bearer {token}"}
    create_response = requests.post(
        f"{_graph_base()}/{account_id}/media",
        headers=headers,
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": "true",
        },
        timeout=30,
    )
    if not create_response.ok:
        raise _error(create_response, "la creación del Reel")
    creation_id = create_response.json().get("id")
    if not creation_id:
        raise InstagramAPIError("Instagram no devolvió el identificador del Reel")

    for _ in range(60):
        status_response = requests.get(
            f"{_graph_base()}/{creation_id}",
            headers=headers,
            params={"fields": "status_code"},
            timeout=20,
        )
        if not status_response.ok:
            raise _error(status_response, "el procesamiento del Reel")
        status = status_response.json().get("status_code")
        if status == "FINISHED":
            break
        if status in {"ERROR", "EXPIRED"}:
            raise InstagramAPIError(f"Instagram no pudo procesar el Reel ({status})")
        time.sleep(5)
    else:
        raise InstagramAPIError("Instagram no terminó de procesar el Reel a tiempo")

    publish_response = requests.post(
        f"{_graph_base()}/{account_id}/media_publish",
        headers=headers,
        data={"creation_id": creation_id},
        timeout=30,
    )
    if not publish_response.ok:
        raise _error(publish_response, "la publicación del Reel")
    media_id = publish_response.json().get("id")
    if not media_id:
        raise InstagramAPIError("Instagram no devolvió el ID de la publicación")
    return media_id
