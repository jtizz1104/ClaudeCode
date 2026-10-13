# Sitio SosaGroup

Sitio estático en HTML, CSS y JavaScript. No necesita instalación ni compilación: se abre `index.html` en el navegador o se sube la carpeta tal cual a cualquier hosting.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Página del grupo: portada, quiénes somos, propósito, visión, misión y valores, historia, equipo, servicios, proceso, oficinas, testimonios, contacto. |
| `real-estate.html` | SosaGroup Real Estate: buscador, mapa de propiedades y desarrollos, servicios, zonas, proceso, preguntas frecuentes, contacto. |

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

1. **Contacto.** En las dos páginas, reemplazar `[completar número]` y `[completar correo]`. El enlace de WhatsApp debe ser `https://wa.me/595XXXXXXXXX` (número sin espacios ni `+`).
2. **Redes sociales.** En la barra superior de las dos páginas, poner los enlaces reales de Facebook, Instagram, LinkedIn y correo (hoy están en `href="#"`).
3. **Envío de formularios.** En `assets/main.js`, completar `FORM_ENDPOINT` con la dirección que recibe los formularios (por ejemplo Formspree, Netlify Forms o un servidor propio). Mientras esté vacío, los formularios validan pero muestran el aviso de vista previa.
4. **Fotos.** Van en `assets/img/`. Si se usa el mismo nombre de archivo, no hay que tocar el HTML.
   - `hero-real-estate.jpg`: portada de Real Estate (falta).
   - `hero-paraguay.jpg`: portada del grupo. La actual sale de una captura; conviene reemplazarla por el original (unos 2400 px de ancho).
   - `gloria-sosa.jpg`, `wtc-asuncion.jpg`, `wtc-cartel.jpg`, `gloria-con-clientes.jpg`: salen de capturas del sitio anterior; conviene reemplazarlas por los originales.
5. **Inmuebles reales.** En `assets/data/inmuebles.js`, reemplazar los 8 ejemplos (`ejemplo: true` muestra la etiqueta "Ejemplo"). El archivo explica cada campo. Las coordenadas se copian de Google Maps con clic derecho sobre el punto. Las fotos de los inmuebles van en `assets/img/inmuebles/`.
6. **Enlace "Acceso equipo"** del pie de página: hoy apunta a `/panel`; ajustarlo o quitarlo.

## Idiomas

El texto se escribe en castellano en el HTML. Para que una frase nueva aparezca en inglés y portugués, se agrega en `assets/i18n-dict.js` con el texto en castellano exacto como clave. Si una frase no está en el diccionario, se muestra en castellano.

Para ver qué frases de una página faltan traducir, abrir la consola del navegador y ejecutar:

```js
sosaI18n.strings().filter((s) => !(s in SOSA_I18N.en))
```

## Mapa

El mapa usa las calles de CARTO (gratis para tráfico moderado). Si el sitio crece mucho, conviene una cuenta propia, por ejemplo en MapTiler; se cambia en la línea `L.tileLayer(...)` de `assets/re-map.js`. Debajo de las calles hay un contorno de Paraguay (`assets/data/paraguay-geo.js`) que se ve si las calles no cargan.
