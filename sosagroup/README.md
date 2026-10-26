# Sitio SosaGroup

Sitio estático en HTML, CSS y JavaScript. No necesita instalación ni compilación: se abre `index.html` en el navegador o se sube la carpeta tal cual a cualquier hosting.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Página del grupo: portada, quiénes somos, propósito, visión, misión y valores, historia, equipo, servicios, proceso, oficinas, testimonios, contacto. |
| `real-estate.html` | SosaGroup Real Estate: buscador, mapa de propiedades y desarrollos, servicios, zonas, proceso, preguntas frecuentes, contacto. |
| `guia-de-tramites.html` | Guía de Trámites: las cinco áreas. |
| `real-estate/<proyecto>.html` | Una página por proyecto. **Se generan con `tools/build_pages.py`; no editarlas a mano.** |
| `guia-de-tramites/<area>.html` | Una página por área de la guía. **Se generan con `tools/build_pages.py`; no editarlas a mano.** |
| `en/`, `pt/` | Todas las páginas en inglés y portugués. **Se generan automáticamente; no editarlas a mano** (ver "Idiomas"). |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Archivos para buscadores y asistentes de IA (ver "Buscadores e IA"). |

## Archivos principales

| Archivo | Para qué sirve |
|---|---|
| `assets/styles.css` | Todos los estilos. Los colores de marca están al principio, en `:root` (bordó `--brand: #8a2454`). |
| `assets/main.js` | Menú móvil, pestañas, reseñas, validación y envío de formularios. |
| `assets/i18n.js` | Cambio de idioma (ES / EN / PT). |
| `assets/i18n-dict.js` | Traducciones al inglés y portugués. La clave es la frase original en castellano. |
| `assets/re-map.js` | Mapa de Real Estate (fichas, filtros, listado). |
| `assets/data/inmuebles.js` | Lista de inmuebles y desarrollos del mapa. |
| `assets/img/` | Fotos. |
| `assets/vendor/` | Librerías del mapa (Leaflet y Leaflet.markercluster), con sus licencias. |

## Pendientes antes de publicar

Para encontrar estos puntos en el código, busque `TODO` y `[completar`.

1. **Contacto.** Listo: grupo y Guía con WhatsApp y teléfono +595 981 504 861 y correo info@sosagroup.com.py; Real Estate con los datos de Silvana Gimenez.
2. **Redes sociales.** Los íconos de Facebook, Instagram y LinkedIn se quitaron de la barra superior hasta tener los enlaces reales. Para volver a ponerlos: `<a href="URL" target="_blank" rel="noopener" aria-label="Instagram de SosaGroup"><svg aria-hidden="true"><use href="#i-instagram"/></svg></a>` (los íconos `#i-facebook`, `#i-instagram` e `#i-linkedin` siguen en cada página).
3. **Envío de formularios.** Con FormSubmit (gratis, sin cuenta). El destino de cada formulario está en `FORM_ENDPOINTS` de `assets/main.js`, según el atributo `data-form` del `<form>`: `grupo` (Inicio y Guía) llega a info@sosagroup.com.py y `real-estate` a Silvana. **La primera consulta de cada casilla dispara un correo "Activate Form" de FormSubmit que hay que confirmar**; hasta entonces el formulario avisa que está pendiente de activación. Después de activarlo, FormSubmit da un código aleatorio: reemplazar el correo por ese código en `FORM_ENDPOINTS` para que la dirección no quede a la vista.
4. **Fotos.** Van en `assets/img/`. Si se usa el mismo nombre de archivo, no hay que tocar el HTML.
   - `hero-real-estate.jpg`: portada de Real Estate (falta).
   - `hero-paraguay.jpg`: portada del grupo. La actual sale de una captura; conviene reemplazarla por el original (unos 2400 px de ancho).
   - `gloria-sosa.jpg`, `wtc-asuncion.jpg`, `gloria-con-clientes.jpg`: salen de capturas del sitio anterior; conviene reemplazarlas por los originales.
5. **Inmuebles y proyectos.** Se cargan en `assets/data/inmuebles.js` (el archivo explica cada campo). Las coordenadas se copian de Google Maps con clic derecho sobre el punto. Las fotos van en `assets/img/inmuebles/` y los brochures en `assets/brochures/`.
6. **Aviso de privacidad** (`privacidad.html`): texto general armado según lo que hace el sitio hoy. Conviene que lo revise un abogado, y actualizarlo si se agregan estadísticas, publicidad u otros servicios.

## Vista de prueba en internet

`.github/workflows/sosagroup-pages.yml` publica esta carpeta en https://jtizz1104.github.io/ClaudeCode/ cada vez que se une un cambio a `main`. Sirve para probar el sitio desde el celular; los buscadores igual toman como dirección oficial `sosagroup.com.py` (canonical). Requiere, una sola vez: GitHub → Settings → Pages → Source: **GitHub Actions**.

## Video y música de la portada de Real Estate

- **Video:** `assets/video/real-estate-hero.mp4` y `.webm` (sin sonido, en bucle; se pausa cuando la portada no está a la vista). Se generaron recortando el 38 % izquierdo del video original para que sus títulos no se crucen con los textos de la portada. Para cambiarlo, reemplazar los dos archivos con el mismo nombre.
- **Música:** `assets/audio/arpa-guarania.mp3`, composición original de arpa en estilo guarania (sin derechos de terceros). Los navegadores no permiten sonido automático, así que suena solo al tocar el botón "Activar sonido". Para usar otra grabación (con licencia), reemplazar el archivo.

## Generar las páginas

Después de cambiar cualquier HTML en castellano, los datos de proyectos (`assets/data/inmuebles.js`) o de la guía (`assets/data/guia.json`), ejecutar en este orden desde la carpeta `sosagroup/`:

```
python3 tools/build_pages.py    # páginas de proyectos y de áreas de la guía (requiere Node.js)
python3 tools/build_i18n.py     # versiones en inglés y portugués, SEO y sitemap
```

- **Proyecto con página propia:** en `inmuebles.js`, agregar `slug` (por ejemplo `"torre-mirador"`) y genera `real-estate/torre-mirador.html` con galería, tipologías, amenities, mapa, brochure y formulario.
- **Guía de Trámites:** en `guia.json`, cada área tiene su lista `tramites`. Cada trámite puede ser solo el título o un objeto con `titulo`, `descripcion`, `requisitos` (lista) y `plazo`. Si un área no tiene trámites, la página muestra una invitación a consultar.

## Idiomas

El castellano es la fuente: se edita `index.html` y `real-estate.html`. Las versiones en inglés (`en/`) y portugués (`pt/`) son páginas propias, para que los buscadores indexen cada idioma, y se generan con:

```
python3 tools/build_i18n.py
```

El script traduce con `assets/i18n-dict.js` (la clave es la frase exacta en castellano), actualiza en las seis páginas el bloque SEO (canonical, hreflang, Open Graph) y los enlaces del selector de idioma, y regenera `sitemap.xml`. Al terminar lista las frases que faltan traducir; esas quedan en castellano hasta que se agreguen al diccionario.

**Cada vez que se cambie un texto en castellano, hay que agregar su traducción al diccionario y volver a ejecutar el script.**

## Buscadores e IA

- **Dominio.** Todo está preparado para `https://sosagroup.com.py/`, con el contenido de esta carpeta en la raíz del sitio. Si cambia, actualizar `BASE` en `tools/build_i18n.py`, las URLs de los bloques `application/ld+json` del HTML, `robots.txt` y `llms.txt`.
- **Datos estructurados** (bloques `application/ld+json` en la cabecera): empresa, dirección, equipo, servicios, Real Estate y preguntas frecuentes. Cuando estén los datos de contacto y las redes, agregar `"telephone"`, `"email"` y `"sameAs"` (lista de enlaces a las redes) al bloque de la empresa. Se pueden validar en https://search.google.com/test/rich-results
- **`robots.txt`** permite el acceso a Google, Bing y a los rastreadores de ChatGPT, Claude, Perplexity y Apple.
- **`llms.txt`** es un resumen de la empresa pensado para asistentes de IA. Mantenerlo al día si cambian servicios, equipo o dirección.
- **Al publicar:** dar de alta el sitio y enviar `sitemap.xml` en Google Search Console y en Bing Webmaster Tools (Bing alimenta a ChatGPT y Copilot).
- **No perder lo que ya está posicionado.** El sitio actual de `sosagroup.com.py` ya tiene páginas indexadas en Google (blog, Guía de Trámites, servicios, testimonios, contacto). Antes de reemplazarlo:
  1. Listar todas sus direcciones (Google Search Console → Páginas, o el sitemap del sitio actual).
  2. Mantener el blog y la Guía de Trámites publicados (son el contenido que más búsquedas atrae) y enlazarlos desde el menú y el pie del sitio nuevo.
  3. Para cada página que desaparezca, configurar una redirección 301 en el hosting hacia la página nueva equivalente (por ejemplo `/quienes-somos/` → `/#nosotros`, `/contacto/` → `/#contacto`). Sin esas redirecciones, quien llegue desde Google a una dirección vieja verá un error y el sitio pierde posicionamiento.
  4. Después de publicar, revisar en Search Console durante las primeras semanas que no aparezcan errores 404.

## Mapa

El mapa de Real Estate usa las capas de `assets/map-base.js`:

- **Calles:** OpenStreetMap, con nombres de calles hasta el máximo acercamiento. Gratis y sin clave (su política de uso pide no superar un tráfico moderado).
- **Satélite:** imágenes de Esri, con las calles y sus nombres encima (también de Esri). Gratis y sin clave.
- Al abrir un proyecto, el mapa se acerca a nivel de calle. La ficha tiene los botones "Ver la calle (Street View)" y "Ver ubicación en Google Maps".

La página de cada proyecto muestra el mapa de Google en vista satelital (inserción gratuita, sin clave ni cuenta) y los mismos dos botones. Street View se abre en Google Maps; para mostrarlo dentro de la página haría falta una clave de la API Maps Embed.

Si el sitio crece mucho, conviene una cuenta propia (por ejemplo en MapTiler); se cambian las URLs en `map-base.js`. Debajo de las capas hay un contorno de Paraguay (`assets/data/paraguay-geo.js`) que se ve si no cargan.

## Video de la portada de inicio (WTC Asunción)

- `assets/video/inicio-wtc.mp4` / `.webm`: video de fondo de la portada (`index.html`), 1280×720, ~29 s en bucle, sin sonido, armado con fotos del WTC Asunción (oficinas en Torre 4 · Piso 12 · Of. C).
- `assets/img/hero-wtc.jpg`: primer cuadro, se muestra mientras carga el video o si el navegador no lo reproduce.
- Arranca solo, se pausa cuando sale de pantalla y no se reproduce si el usuario tiene activado "reducir movimiento".

## Seguridad

- **Política de contenido (CSP)**: cada página tiene un `<meta http-equiv="Content-Security-Policy">` que solo deja cargar scripts del propio sitio y, de afuera, los mapas (OpenStreetMap, Esri, Google Maps) y el envío a FormSubmit. Si se agrega un servicio externo (estadísticas, chat, un video de YouTube…), hay que sumar su dominio en esa línea de `index.html`, `real-estate.html`, `guia-de-tramites.html` y `privacidad.html`, y volver a generar las páginas; si no, el navegador lo bloquea.
- **Sin código dentro del HTML**: nada de `onclick=`, `onerror=` ni `<script>` con código en las páginas (lo bloquea la CSP). Todo va en `assets/*.js`.
- **Formularios**: llevan un campo trampa invisible (`_honey`) que agrega `main.js`; si un bot lo completa, el envío se descarta.
- **Qué se publica**: el flujo de GitHub Pages deja afuera `README.md`, `tools/` y `assets/i18n-dict.js`.
- **Tipografías**: Inter y Outfit están en `assets/fonts/` (no se cargan de Google Fonts).
- **Brochures**: antes de subir un PDF nuevo, borrarle los metadatos (autor, programa) con `python3 -c "import pikepdf,sys; p=pikepdf.open(sys.argv[1],allow_overwriting_input=True); [d.__delitem__(k) for d,k in ((p.trailer,'/Info'),(p.Root,'/Metadata')) if k in d]; p.save(sys.argv[1])" archivo.pdf`.

## Rendimiento

- **Fotos de inmuebles**: cada `.jpg` de `assets/img/inmuebles/` tiene una versión liviana `-sm.webp` (640 px) para las tarjetas del mapa y las fichas. Al agregar fotos nuevas, crearla con `python3 -c "from PIL import Image;import sys;f=sys.argv[1];im=Image.open(f).convert('RGB');im.thumbnail((640,9999));im.save(f[:-4]+'-sm.webp','WEBP',quality=72,method=6)" assets/img/inmuebles/foto.jpg`.
- **Videos de portada**: hay una versión vertical liviana para celular (`*-movil.mp4/.webm`, 432×720). El video arranca recién cuando terminó de cargar la página, y no se reproduce con el ahorro de datos activado.
- **Traducciones**: las páginas en castellano no cargan el diccionario; las de inglés y portugués cargan solo `assets/i18n-en.js` o `assets/i18n-pt.js`, que genera `tools/build_i18n.py`.
