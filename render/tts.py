"""Interfaz de texto a voz. Por defecto usa gTTS (gratis, sin API key, calidad
robótica). Para voces naturales en producción, seteá TTS_PROVIDER=elevenlabs
y completá ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID en .env."""

from __future__ import annotations

import os
from pathlib import Path


def synthesize(text: str, out_path: str | Path) -> Path:
    provider = os.environ.get("TTS_PROVIDER", "gtts")
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if provider == "gtts":
        _synthesize_gtts(text, out_path)
    elif provider == "elevenlabs":
        _synthesize_elevenlabs(text, out_path)
    else:
        raise ValueError(f"TTS_PROVIDER desconocido: {provider!r} (usá 'gtts' o 'elevenlabs')")
    return out_path


def _synthesize_gtts(text: str, out_path: Path) -> None:
    from gtts import gTTS

    gTTS(text=text, lang="es").save(str(out_path))


def _synthesize_elevenlabs(text: str, out_path: Path) -> None:
    import requests

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID")
    if not api_key or not voice_id:
        raise RuntimeError("Faltan ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID en .env")

    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={"xi-api-key": api_key, "Content-Type": "application/json"},
        json={"text": text, "model_id": "eleven_multilingual_v2"},
        timeout=60,
    )
    resp.raise_for_status()
    out_path.write_bytes(resp.content)
