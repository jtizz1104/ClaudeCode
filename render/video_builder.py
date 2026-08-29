"""Renderiza un short vertical (1080x1920) a partir de un guion generado por
los pipelines: {title, narration, on_screen_text, hashtags}.

No depende de ImageMagick: el texto se renderiza como PNG con Pillow y se
compone en video con moviepy. Es un render "flat design" (fondo sólido +
texto animado por corte) pensado como MVP funcional; para algo más elaborado
(B-roll, transiciones, marca) se puede migrar a Remotion más adelante sin
tocar los pipelines de arriba, que solo dependen de este módulo exponiendo
build_short().
"""

from __future__ import annotations

import os
from pathlib import Path
from textwrap import wrap

from moviepy import AudioFileClip, ImageClip, concatenate_videoclips
from PIL import Image, ImageDraw, ImageFont

from render import tts

WIDTH, HEIGHT = 1080, 1920
BG_COLOR = (12, 14, 22)
ACCENT_COLOR = (94, 234, 212)
TEXT_COLOR = (245, 245, 245)
HANDLE_COLOR = (150, 155, 168)


def _font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


def _render_text_frame(headline: str, body: str) -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    bar_y = HEIGHT // 2 - 200
    draw.rectangle([0, bar_y, WIDTH, bar_y + 12], fill=ACCENT_COLOR)

    body_font = _font(52)
    lines = wrap(body, width=22) or [body]
    total_h = len(lines) * (body_font.size + 20)
    y = HEIGHT // 2 - total_h // 2
    for line in lines:
        w = draw.textlength(line, font=body_font)
        draw.text(((WIDTH - w) / 2, y), line, font=body_font, fill=TEXT_COLOR)
        y += body_font.size + 20

    headline_font = _font(60)
    head_lines = wrap(headline, width=26) or [headline]
    y = bar_y - 30 - (len(head_lines) * (headline_font.size + 10))
    for line in head_lines:
        w = draw.textlength(line, font=headline_font)
        draw.text(((WIDTH - w) / 2, y), line, font=headline_font, fill=ACCENT_COLOR)
        y += headline_font.size + 10

    handle = os.environ.get("CHANNEL_HANDLE", "@codigonegocioia")
    handle_font = _font(36)
    w = draw.textlength(handle, font=handle_font)
    draw.text(((WIDTH - w) / 2, HEIGHT - 120), handle, font=handle_font, fill=HANDLE_COLOR)

    return img


def build_short(script: dict, out_path: str | Path) -> Path:
    """Genera el mp4 final. Devuelve el Path del video ya renderizado."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    audio_path = tts.synthesize(script["narration"], out_path.with_suffix(".mp3"))
    audio = AudioFileClip(str(audio_path))

    segments = script.get("on_screen_text") or [script["title"]]
    seg_duration = max(audio.duration / len(segments), 1.0)

    frame_paths = []
    clips = []
    for i, text in enumerate(segments):
        frame = _render_text_frame(script["title"], text)
        frame_path = out_path.with_name(f"{out_path.stem}_frame_{i}.png")
        frame.save(frame_path)
        frame_paths.append(frame_path)
        clips.append(ImageClip(str(frame_path)).with_duration(seg_duration))

    video = concatenate_videoclips(clips, method="compose").with_audio(audio)
    video.write_videofile(
        str(out_path),
        fps=30,
        codec="libx264",
        audio_codec="aac",
        threads=4,
        logger=None,
    )

    for frame_path in frame_paths:
        frame_path.unlink(missing_ok=True)
    audio_path.unlink(missing_ok=True)

    return out_path
