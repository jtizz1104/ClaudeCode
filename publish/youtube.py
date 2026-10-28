"""Publicación en YouTube (Shorts) vía YouTube Data API v3.

Setup (una sola vez):
1. Crear un proyecto en https://console.cloud.google.com/
2. Habilitar "YouTube Data API v3" en ese proyecto.
3. Crear credenciales OAuth 2.0 tipo "Desktop app" y descargar el JSON.
4. Guardar ese JSON en la ruta de YOUTUBE_CLIENT_SECRETS_FILE (ver .env.example).
5. La primera vez que corras upload(), se abre el navegador para autorizar
   tu cuenta de YouTube; el token se cachea en YOUTUBE_TOKEN_FILE para las
   próximas corridas (no hace falta volver a loguearse).

Requiere: pip install google-api-python-client google-auth-oauthlib
(no están en requirements.txt todavía porque este módulo es un stub — se
agregan cuando actives esta integración).
"""

from __future__ import annotations

import os
from pathlib import Path

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def _get_credentials():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    token_file = Path(os.environ["YOUTUBE_TOKEN_FILE"])
    creds = None
    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                os.environ["YOUTUBE_CLIENT_SECRETS_FILE"], SCOPES
            )
            creds = flow.run_local_server(port=0)
        token_file.parent.mkdir(parents=True, exist_ok=True)
        token_file.write_text(creds.to_json())
    return creds


def upload(video_path: str, title: str, description: str, tags: list[str]) -> str:
    """Sube un short a YouTube. Devuelve el video_id."""
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    youtube = build("youtube", "v3", credentials=_get_credentials())
    request = youtube.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": "28",  # Science & Technology
            },
            "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False},
        },
        media_body=MediaFileUpload(video_path, chunksize=-1, resumable=True),
    )
    response = request.execute()
    return response["id"]
