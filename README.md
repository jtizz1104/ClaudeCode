# AI & Markets Content Studio

Pipeline de contenido automatizado para **@codigonegocioia** (YouTube,
Instagram y TikTok), un canal de negocios + IA. El handle se usa como marca
en el watermark de los videos y en el cierre/hashtags de los guiones — se
puede cambiar seteando `CHANNEL_HANDLE` en `.env`. Todos los días genera:

1. **Resumen de IA**: rastrea qué pasó en las últimas 24hs (lanzamientos,
   papers, movidas de las grandes empresas) y arma un short por cada noticia
   relevante.
2. **Informe de mercados**: analiza los sectores que seguís (semiconductores,
   infraestructura, energía limpia, energía convencional, energía nuclear) y
   arma un short por sector con los movimientos del día.

## Cómo está armado

```
config/                  Fuentes de noticias y tickers por sector (editables)
pipelines/
  common/                LLM (Anthropic) y persistencia de outputs
  ai_news/               fetch -> resumen diario -> guiones de shorts
  markets/                fetch -> informe diario -> guiones de shorts
render/                  Texto a voz + armado del video vertical (1080x1920)
publish/                 Subida a YouTube / Instagram / TikTok
dashboard/               Panel web para revisar/aprobar el contenido del día
storage/                 Outputs del día: digest/informe, guiones, videos
scripts/build_shorts.py  Renderiza en video los guiones de un pipeline
```

Cada etapa guarda su resultado en `storage/<pipeline>/<fecha>/` como JSON, así
podés revisar el contenido (o corregirlo a mano) antes de pasar a la
siguiente etapa.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completá ANTHROPIC_API_KEY como mínimo
```

## Uso día a día

```bash
# 1. Generar el resumen de IA + guiones de shorts
python -m pipelines.ai_news.run

# 2. Generar el informe de mercados + guiones de shorts
python -m pipelines.markets.run

# 3. Renderizar los guiones en video (usa gTTS por defecto, sin API key)
python scripts/build_shorts.py ai_news
python scripts/build_shorts.py markets

# Los mp4 quedan en storage/<pipeline>/<fecha>/videos/

# 4. Levantar el panel para revisar/aprobar el contenido del día
uvicorn dashboard.app:app --reload
# abrir http://localhost:8000
```

Cada guion sigue el formato real de producción del canal (no un párrafo
narrado): 9-14 líneas numeradas tipo "beat", una tabla de b-roll/fuente en
pantalla por rango de líneas, una nota de contraste visual, marca de si
incluye el disclaimer de inversión, y continuidad automática con noticias
de días anteriores (el guionista recibe los títulos recientes del canal y
puede marcar explícitamente "es la tercera vez que..."). El render usa esas
mismas líneas como texto animado en pantalla, sincronizadas con el audio.

Por ahora la subida a redes es manual: en el panel revisás cada short
(guion línea por línea, b-roll sugerido, video, caption por plataforma) y
lo marcás como aprobado; una vez que lo subís a mano desde la app de cada
plataforma, lo marcás como publicado. Cada guion ya incluye un campo
`captions` con el texto listo para pegar en Instagram, TikTok y YouTube
(hook + hashtags ajustados a las reglas de cada red) — el botón "Copiar"
de cada card lo copia al portapapeles.
Los módulos de `publish/` ya están escritos y listos para activar en cuanto
tengas las cuentas de developer de cada plataforma — la guía paso a paso
para darlas de alta está en [`docs/PLATFORM_SETUP.md`](docs/PLATFORM_SETUP.md).

## Correrlo solo todos los días (cron)

El pipeline necesita salida a internet sin restricciones (RSS, Yahoo
Finance/yfinance, arXiv, y el endpoint de gTTS), así que tiene que vivir en
tu propia máquina o un servidor tuyo, no en un sandbox con red restringida.
Para que se autogenere sin que lo toques, agregá algo así a tu `crontab -e`
(ejemplo: todos los días a las 7am, hora local):

```cron
0 7 * * * cd /ruta/a/ClaudeCode && .venv/bin/python -m pipelines.ai_news.run >> storage/ai_news.log 2>&1
5 7 * * * cd /ruta/a/ClaudeCode && .venv/bin/python -m pipelines.markets.run >> storage/markets.log 2>&1
10 7 * * * cd /ruta/a/ClaudeCode && .venv/bin/python scripts/build_shorts.py ai_news >> storage/ai_news.log 2>&1
15 7 * * * cd /ruta/a/ClaudeCode && .venv/bin/python scripts/build_shorts.py markets >> storage/markets.log 2>&1
```

Con eso, todas las mañanas vas a tener los shorts + captions del día
esperando en el panel (`uvicorn dashboard.app:app`) para que los revises y
subas. El archivo `.agents/social-media-context-sms.md` (voz de marca,
audiencia, pilares de contenido — generado con la skill
`social-media-context-sms`) ya está completado con los datos de
@codigonegocioia y los guiones lo respetan vía las reglas de caption
incluidas en `pipelines/common/caption_rules.py`.

## Roadmap

**Fase 0 — Fundación (listo)**
- [x] Pipeline de noticias de IA (fetch RSS + Hacker News + arXiv → resumen → guiones)
- [x] Pipeline de mercados (fetch yfinance por sector → informe → guiones)
- [x] Render de shorts verticales con TTS gratis (gTTS) + texto animado
- [x] Módulos de publicación (YouTube, Instagram, TikTok) documentados y listos para activar

**Fase 1 — Calidad de contenido**
- [x] Voz de marca definida (`.agents/social-media-context-sms.md`) + captions por plataforma (IG/TikTok/YouTube) generados junto al guion
- [x] Formato de guion alineado a producción real: líneas numeradas tipo "beat" + tabla de b-roll + disclaimer + continuidad entre días
- [ ] Mejorar el render: B-roll/gráficos reales (charts de precios, logos de empresas), transiciones, marca del canal
- [ ] Subir la calidad de voz (ElevenLabs u otro TTS neural, ya soportado en `render/tts.py`)
- [ ] Sumar más fuentes de noticias / afinar el criterio de selección de historias

**Fase 2 — Automatización de publicación**
- [ ] Dar de alta las apps de developer en YouTube, Meta (Instagram) y TikTok
- [ ] Conectar `publish/*.py` a un storage con URL pública (S3/Cloud Storage) para Instagram
- [ ] Automatizar la corrida diaria completa (cron / GitHub Actions) con revisión humana antes de publicar

**Fase 3 — Dashboard (listo el MVP)**
- [x] Panel web (`dashboard/`) para ver el resumen/informe del día, mirar los shorts generados y marcarlos como aprobado/publicado
- [ ] Edición del guion/texto en pantalla desde el propio panel (hoy se edita el JSON a mano)
- [ ] Historial de contenido publicado y métricas básicas por plataforma

## Notas importantes

- **Costos**: cada corrida usa la API de Anthropic (resumen + guiones). Con
  ~10-15 guiones cortos por día el costo es bajo, pero monitoreá el uso en
  https://console.anthropic.com/
- **Datos de mercado**: yfinance es gratuito pero no oficial ni en tiempo
  real estricto; para uso más serio conviene migrar a un proveedor pago
  (Polygon.io, Alpha Vantage) — el módulo `pipelines/markets/fetch.py` está
  aislado para que ese cambio no toque el resto del pipeline.
- **Esto no es asesoramiento financiero**: los guiones de mercados están
  instruidos para describir movimientos, no para recomendar comprar/vender.
