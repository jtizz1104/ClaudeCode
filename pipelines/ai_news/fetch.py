"""Recolecta noticias de IA de las últimas 24hs desde RSS, Hacker News y arXiv."""

from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone
from typing import Any

import feedparser
import requests
import yaml

CONFIG_PATH = "config/sources_ai_news.yaml"


def load_config(path: str = CONFIG_PATH) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _entry_datetime(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        value = getattr(entry, key, None)
        if value:
            return datetime.fromtimestamp(time.mktime(value), tz=timezone.utc)
    return None


def fetch_rss(feeds: list[dict], hours_lookback: int = 24) -> list[dict[str, Any]]:
    """Trae items de una lista de feeds RSS/Atom publicados en la ventana dada."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_lookback)
    items = []
    for feed in feeds:
        parsed = feedparser.parse(feed["url"])
        for entry in parsed.entries:
            published = _entry_datetime(entry)
            if published and published < cutoff:
                continue
            items.append(
                {
                    "source": feed["name"],
                    "title": entry.get("title", "").strip(),
                    "link": entry.get("link", ""),
                    "summary": entry.get("summary", "")[:500],
                    "published": published.isoformat() if published else None,
                }
            )
    return items


def fetch_hacker_news(keywords: list[str], min_points: int = 50, hours_lookback: int = 24) -> list[dict[str, Any]]:
    """Busca stories de HN de las últimas N horas que matcheen alguna keyword,
    vía la API pública de Algolia (no requiere key)."""
    cutoff_ts = int((datetime.now(timezone.utc) - timedelta(hours=hours_lookback)).timestamp())
    items: list[dict[str, Any]] = []
    seen_ids = set()
    for kw in keywords:
        resp = requests.get(
            "https://hn.algolia.com/api/v1/search_by_date",
            params={
                "query": kw,
                "tags": "story",
                "numericFilters": f"created_at_i>{cutoff_ts},points>={min_points}",
            },
            timeout=15,
        )
        resp.raise_for_status()
        for hit in resp.json().get("hits", []):
            if hit["objectID"] in seen_ids:
                continue
            seen_ids.add(hit["objectID"])
            items.append(
                {
                    "source": "Hacker News",
                    "title": hit.get("title") or "",
                    "link": hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}",
                    "summary": f"{hit.get('points', 0)} puntos, {hit.get('num_comments', 0)} comentarios",
                    "published": hit.get("created_at"),
                }
            )
    return items


def fetch_arxiv(categories: list[str], max_results: int = 15, hours_lookback: int = 24) -> list[dict[str, Any]]:
    """Trae papers recientes de arXiv por categoría (API pública, sin key)."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_lookback)
    query = " OR ".join(f"cat:{c}" for c in categories)
    resp = requests.get(
        "http://export.arxiv.org/api/query",
        params={
            "search_query": query,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
            "max_results": max_results,
        },
        timeout=20,
    )
    resp.raise_for_status()
    parsed = feedparser.parse(resp.text)
    items = []
    for entry in parsed.entries:
        published = _entry_datetime(entry)
        if published and published < cutoff:
            continue
        items.append(
            {
                "source": "arXiv",
                "title": entry.get("title", "").replace("\n", " ").strip(),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", "")[:500].replace("\n", " "),
                "published": published.isoformat() if published else None,
            }
        )
    return items


def fetch_all(config: dict | None = None) -> list[dict[str, Any]]:
    config = config or load_config()
    items = []
    items += fetch_rss(config["rss"], config.get("arxiv", {}).get("hours_lookback", 24))
    hn_cfg = config.get("hacker_news", {})
    if hn_cfg:
        items += fetch_hacker_news(
            hn_cfg.get("keywords", []),
            hn_cfg.get("min_points", 50),
            hn_cfg.get("hours_lookback", 24),
        )
    arxiv_cfg = config.get("arxiv", {})
    if arxiv_cfg:
        items += fetch_arxiv(
            arxiv_cfg.get("categories", []),
            arxiv_cfg.get("max_results", 15),
            arxiv_cfg.get("hours_lookback", 24),
        )
    return items


if __name__ == "__main__":
    for item in fetch_all():
        print(f"[{item['source']}] {item['title']}")
