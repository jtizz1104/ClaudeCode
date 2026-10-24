"""Reglas de hook/caption por plataforma (condensado de las skills hook-writer-sms
y caption-writer-sms) para que el LLM genere captions listos para pegar en cada
red, sin depender de invocar una skill a mano en cada corrida."""

PLATFORM_CAPTION_RULES = """Generá también un objeto "captions" con el texto
listo para pegar en cada plataforma, siguiendo estas reglas:

INSTAGRAM (Reel):
- Los primeros ~125 caracteres son los únicos que se ven antes de "...más": ahí
  va el hook (gancho), no una descripción genérica.
- Estructura: hook (1 línea) -> payoff/contexto breve -> CTA de guardar o
  compartir.
- 3-10 hashtags al final, mezclando el de marca, el de nicho (#IA, #mercados)
  y 1-2 más específicos de la noticia/sector.

TIKTOK:
- El gancho real es el video (primeros 1-3 segundos); el caption escrito
  refuerza ese gancho y sirve para el buscador interno de TikTok (usá
  keywords que alguien tipearía).
- Tono conversacional, poco pulido. Idealmente bajo 150 caracteres.
- 3-5 hashtags: uno amplio, uno de nicho, y 1-2 específicos del tema.

YOUTUBE (Short):
- "título": 60-70 caracteres, con la keyword principal adelante y un gancho
  de curiosidad o número específico (sin clickbait que el video no cumpla).
- "descripción": corta (bajo 150 caracteres), con un CTA suave ("seguí el
  canal para más") y terminando con el hashtag #shorts (obligatorio para
  elegibilidad en el shelf de Shorts) + hasta 2 hashtags más.

En los tres casos, el cierre debe invitar a volver al canal (no vender nada),
y el tono tiene que respetar la marca: directo, analítico, "datos, contexto y
preguntas incómodas" — nunca hype de finfluencer."""
