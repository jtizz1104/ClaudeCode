# Social Media Context

last_updated: 2026-10-24

---

## Identity

- **Type**: Brand (canal de contenido)
- **Name**: Código Negocio (perfil muestra "Código Negocio"; el canal/handle completo es Código Negocio IA)
- **Handle(s)**: @codigonegocioia en Instagram y TikTok; YouTube en youtube.com/@CodigoNegocioIA
- **Role**: Canal diario de negocios + IA — resume lo nuevo en inteligencia artificial y analiza movimientos de mercado en sectores estratégicos
- **Industry/niche**: IA, mercados e infraestructura — chips, energía y centros de datos (bio real del perfil)
- **Positioning**: "Datos, contexto y preguntas incómodas" (bio verbatim de Instagram) — no es un resumen complaciente, cuestiona y contextualiza en vez de solo reportar

**Bio actual de Instagram (verbatim):**
> IA, mercados e infraestructura.
> Chips, energía y centros de datos.
> Datos, contexto y preguntas incómodas.

**Estado real (2026-10-24):** cuenta de IG ya activa con 8 publicaciones (0 seguidores, 3 seguidos) — el canal arrancó a subir contenido ya, esto no es un lanzamiento desde cero. Revisar esas 8 publicaciones para extraer ejemplos reales de voz en la sección "Example Posts" más abajo.

---

## Target Audience

- **Primary audience**: Profesionales y emprendedores de habla hispana interesados en negocios y tecnología — quieren estar al día sin leer 20 newsletters
- **Pain points**: No tienen tiempo de rastrear papers/lanzamientos de IA ni movimientos de sectores todos los días; la info de mercados suele ser en inglés o demasiado técnica
- **Goals**: Mantenerse informados para tomar mejores decisiones de negocio/inversión propias; entender hacia dónde va la IA y qué sectores se mueven
- **Sophistication level**: Intermedio — entienden de negocios, no necesariamente son expertos técnicos en IA ni analistas financieros
- **Where they hang out**: Instagram Reels, YouTube Shorts, TikTok — consumo corto, vertical, en el celular

---

## Voice & Tone

- **Voice adjectives**: directo, analítico, con autoridad, escéptico/cuestionador ("preguntas incómodas"), sin relleno
- **Formality**: Semi-formal
- **Humor**: Ninguno / muy ocasional — el tono es de analista serio pero accesible, no un reportero neutral: cuestiona el hype en vez de solo repetirlo
- **Phrases to use**: español rioplatense neutro; "datos, contexto y preguntas incómodas" (tagline de marca, reutilizable como cierre/hook); cierres que invitan a volver mañana ("seguinos para el resumen de mañana"); cierre casi universal en formato de **pregunta reflexiva al espectador** (ver Example Posts)
- **Phrases to avoid**: jerga de "finfluencer" ("a la luna 🚀", "esto va a explotar"), superlativos sin sustento, clickbait financiero, entusiasmo acrítico por cada anuncio de IA
- **Regla de disclaimer**: todo guion que mencione un ticker/acción específica debe incluir una variante corta de "no es recomendación de inversión" cerca del cierre, alternando la redacción entre guiones para no repetir siempre la misma frase (ya se usan al menos 3 variantes distintas en producción)

---

## Content Pillars

1. **Resumen diario de IA** — lanzamientos, papers y movidas de las grandes empresas de las últimas 24hs, explicado para alguien de negocios (no técnico)
2. **Informe de mercados — Chips/semiconductores** — SOXX + NVDA, AMD, TSM, INTC, AVGO, ASML, QCOM, ARM
3. **Informe de mercados — Infraestructura** — PAVE + VRT, ETN, PWR, NVT, CAT, GEV
4. **Informe de mercados — Energía** — limpia (ICLN + NEE, ENPH, FSLR, PLUG, SEDG, BE), convencional (XLE + XOM, CVX, COP, SLB, OXY) y nuclear (URA + CCJ, BWXT, SMR, LEU, CEG, VST)

**Por qué el canal es creíble en esto**: cobertura diaria sistemática (no oportunista) de las mismas fuentes/tickers, con disclaimer explícito de que es informativo y no asesoramiento financiero.

---

## Platform Configuration

| Platform | Goal | Current Frequency | Target Frequency | Automatizado |
|---|---|---|---|---|
| YouTube Shorts | Crecer audiencia / autoridad | Manual (pipeline listo, falta credenciales API) | Diaria | Guion+video sí, publicación no (falta OAuth) |
| Instagram Reels | Crecer audiencia | Manual (pipeline listo, falta credenciales API) | Diaria | Guion+video sí, publicación no (falta Graph API + storage público) |
| TikTok | Crecer audiencia | Manual (pipeline listo, falta App Review) | Diaria | Guion+video sí, publicación no (falta App Review) |

**Roadmap de automatización (decisión del usuario, 2026-10-24):** arrancar con
el pipeline propio (gratis, render casero, publicación manual vía dashboard)
y medir resultados reales. Si funciona, pasar a video generado con IA
(higgsfield_ai) y publicación 100% automática en IG/YouTube/TikTok vía
Metricool. No activar higgsfield/Metricool todavía — es la fase siguiente,
condicionada a ver cómo responde la audiencia con el enfoque actual.

---

## Content Formats

- **Preferred formats**: Shorts verticales 1080x1920, 42-48s, **guion numerado de 9-14 líneas cortas (estilo "beat" tipo teleprompter)**, no un párrafo narrado continuo — cada línea es casi un corte de edición distinto
- **Estructura real de producción** (de `guiones-produccion-mes-completo.md`, calendario de 20 videos ya escrito a mano): hook en línea 1 → desarrollo dato por dato → disclaimer si menciona tickers → cierre siempre en forma de pregunta reflexiva al espectador. Cada guion viene acompañado de una tabla de b-roll por rango de líneas, qué líneas llevan "fuente en pantalla", y una nota de "contraste visual clave" (la paradoja/giro que sostiene el video)
- **Reglas de producción de video ya establecidas**: evitar b-roll generado por IA para clips conceptuales/gráficos (riesgo de alucinación de texto/datos — usar banco gratuito tipo Pexels); para personas/marcas con licencia incierta, usar silueta editorial genérica o ilustración propia en vez de foto/diseño real
- **Continuidad entre videos**: cuando un tema se repite (ej. reactivación de plantas nucleares), el guion lo marca explícitamente ("es la tercera planta que reabre este mes") para reforzar la sensación de investigación en curso — identificado como diferenciador del canal frente a competencia en inglés
- **Per-platform preferences**: Mismo short base por noticia/sector, con caption y hashtags adaptados a cada plataforma (ver `caption-writer-sms` / `hook-writer-sms`)
- **Formats to avoid**: Contenido largo (no es un canal de videos de 10+ minutos), memes, contenido de "finfluencer" especulativo

> ⚠️ **Nota para quien mantenga el pipeline automático** (`pipelines/*/script_writer.py`): el formato que generan esos módulos hoy (narración en párrafo + 3-5 bullets de `on_screen_text`) **no coincide** con el formato real de producción de arriba (guion numerado tipo beat + tabla de b-roll). Evaluar si conviene alinear el prompt del pipeline a este formato ya validado, o si el pipeline automático queda como una fuente de borradores/ideas que después se reescriben a mano en este formato.

---

## Example Posts

Extraídos verbatim de `guiones-produccion-mes-completo.md` (calendario de 20
shorts ya escrito por el usuario — la fuente de voz más confiable que
existe hoy, más que los 8 posts de Instagram).

### Ejemplo 1 — Hook + cierre (TSMC)
> Una sola empresa fabrica el 90% de los chips más avanzados del mundo.
> [...]
> Su respuesta fue directa: "Una Gran Depresión".
> Toda la industria tecnológica global depende de una sola isla.
> ¿Qué tan frágil es un mundo que depende de un solo punto?

### Ejemplo 2 — Hook + disclaimer (Soros)
> El fondo de George Soros hizo movimientos que casi nadie notó.
> [...]
> Esto no es una recomendación. Es lo que hizo un fondo.
> Soros no está apostando a la inteligencia artificial en sí misma.
> Está apostando a lo que la sostiene desde abajo.
> ¿Es esta la señal de hacia dónde se mueve el dinero inteligente?

### Ejemplo 3 — Contraste/paradoja como motor del guion (Nvidia circular financing)
> Nvidia no solo vende chips. Ahora también presta el dinero para comprarlos.
> [...]
> Analistas ya le pusieron nombre a esto: inversión circular.
> Nvidia financia a sus propios clientes para que le sigan comprando.
> El mercado lo mira con entusiasmo. Y con sospecha.
> ¿Es esto una rueda que se sostiene sola, o una que se muerde la cola?

**Patrón que se repite en los tres**: hook con tensión/contradicción →
desarrollo con 1-2 cifras duras citadas con fuente → frase de contexto que
reencuadra el dato → cierre siempre en pregunta abierta, nunca en
conclusión cerrada ni en CTA de venta.

---

## Anti-Patterns

- **Topics to avoid**: Recomendaciones explícitas de compra/venta, política partidaria, contenido personal del dueño del canal
- **Tones to avoid**: Hype-y, "finfluencer", motivacional genérico, alarmista
- **Content types to avoid**: Clickbait sin sustento, promesas de rentabilidad, memes
