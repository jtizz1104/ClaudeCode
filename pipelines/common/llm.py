"""Wrapper delgado sobre la API de Anthropic, usado por todos los pipelines
para resumir noticias, analizar sectores y escribir guiones de shorts."""

from __future__ import annotations

import json
import os

from anthropic import Anthropic

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY no está seteada. Copiá .env.example a .env "
                "y cargá tu API key de https://console.anthropic.com/"
            )
        _client = Anthropic(api_key=api_key)
    return _client


def ask(system: str, user: str, max_tokens: int = 2000) -> str:
    """Manda un turno system+user a Claude y devuelve el texto de respuesta."""
    client = _get_client()
    model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def ask_json(system: str, user: str, max_tokens: int = 3000):
    """Igual que ask(), pero parsea la respuesta como JSON. Le pide al modelo
    que responda solo con JSON crudo, sin fences de markdown."""
    text = ask(
        system,
        user + "\n\nRespondé ÚNICAMENTE con JSON válido, sin texto adicional ni markdown.",
        max_tokens,
    ).strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
