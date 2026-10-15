# Reel: residencia legal vs. residencia fiscal en Paraguay

Material de la campaña Meta Lead Ads (formulario instantáneo) para empresarios,
profesionales autónomos e inversores de Argentina, España y Chile.

| Archivo | Para qué sirve |
|---|---|
| `reel-residencia-legal-vs-fiscal.mp4` | Reel 9:16 (1080×1920, 30 fps, 36 s, H.264 + AAC) con gráficos animados, la marca SosaGroup y una base musical suave. Se puede pautar tal cual. |
| `subtitulos.srt` | Subtítulos del guion completo. Sirven para el video que grabe Gloria a cámara y para el reel con locución. |
| `fuente/` | Scripts que generan el video (`render.py`) y la música (`audio.py`), más la tipografía Outfit (licencia OFL). |

## Estructura

| Tiempo | Escena |
|---|---|
| 0–5 s | Hook: "ATENCIÓN": confundir residencia legal con fiscal te puede costar muy caro |
| 5–10,5 s | La cédula paraguaya, con el sello "NO ES RESIDENCIA FISCAL" |
| 10,5–15 s | Obligaciones en el país de origen: Argentina (ARCA), España (Agencia Tributaria), Chile (SII) |
| 15–20,5 s | Comparativa: Legal (migratoria) ≠ Fiscal (define tus impuestos) |
| 20,5–25,5 s | Lo que analiza SosaGroup sobre tu encuadre completo |
| 25,5–36 s | CTA con la foto de Gloria y el botón "Agendar evaluación" |

Las zonas seguras de Reels se respetan: no hay contenido clave en los 250 px de
arriba ni en los ~400 px de abajo.

## Versión "Gloria a cámara"

El video no tiene voz: el entorno de generación no tiene acceso a servicios de
síntesis de voz, y el formato prevé que hable Gloria. Hay dos opciones:

1. **Recomendada:** Gloria graba el guion en vertical (ver `subtitulos.srt`) y se
   intercalan como B-roll las escenas de este reel: la cédula de 5 a 10 s y la
   comparativa de 15 a 20 s.
2. Grabar solo el audio de Gloria y montarlo sobre este reel. Los tiempos de las
   escenas coinciden con los del guion.

## Regenerar

```bash
cd fuente
python3 audio.py                     # genera bed.wav
python3 render.py                    # genera video_noaudio.mp4 (necesita sosagroup/assets/img)
ffmpeg -i video_noaudio.mp4 -i bed.wav -c:v copy -c:a aac -shortest -movflags +faststart reel.mp4
```
