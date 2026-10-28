"""Trae datos de mercado diarios por sector/ticker vía yfinance (sin API key)."""

from __future__ import annotations

from typing import Any

import yaml
import yfinance as yf

CONFIG_PATH = "config/sectors_markets.yaml"


def load_config(path: str = CONFIG_PATH) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _ticker_snapshot(symbol: str) -> dict[str, Any] | None:
    """Último cierre, variación % diaria y volumen de un ticker."""
    hist = yf.Ticker(symbol).history(period="5d")
    if hist.empty or len(hist) < 2:
        return None
    last, prev = hist.iloc[-1], hist.iloc[-2]
    change_pct = (last["Close"] - prev["Close"]) / prev["Close"] * 100
    return {
        "symbol": symbol,
        "close": round(float(last["Close"]), 2),
        "change_pct": round(float(change_pct), 2),
        "volume": int(last["Volume"]),
    }


def fetch_sector(name: str, sector_cfg: dict, significant_move_pct: float) -> dict:
    """Snapshot de un sector: su ETF proxy + tickers individuales."""
    etf_snapshot = _ticker_snapshot(sector_cfg["etf"]) if sector_cfg.get("etf") else None
    tickers = []
    for symbol in sector_cfg.get("tickers", []):
        snap = _ticker_snapshot(symbol)
        if snap:
            snap["significant"] = abs(snap["change_pct"]) >= significant_move_pct
            tickers.append(snap)
    return {
        "sector": name,
        "label": sector_cfg.get("label", name),
        "etf": etf_snapshot,
        "tickers": sorted(tickers, key=lambda t: abs(t["change_pct"]), reverse=True),
    }


def fetch_all(config: dict | None = None) -> list[dict]:
    config = config or load_config()
    threshold = config.get("significant_move_pct", 3.0)
    return [
        fetch_sector(name, cfg, threshold)
        for name, cfg in config["sectors"].items()
    ]


if __name__ == "__main__":
    for sector in fetch_all():
        print(f"\n{sector['label']}:")
        for t in sector["tickers"]:
            flag = " *" if t["significant"] else ""
            print(f"  {t['symbol']}: {t['change_pct']:+.2f}%{flag}")
