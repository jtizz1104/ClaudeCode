# Trámites de developer: YouTube, Instagram, TikTok

Guía paso a paso para dejar activa la publicación automática desde
`publish/youtube.py`, `publish/instagram.py` y `publish/tiktok.py`. Todo esto
lo tenés que hacer vos (requiere tu identidad/cuentas), pero está ordenado
para que sepas exactamente qué crear y dónde pegar cada credencial en `.env`.

Ningún trámite tiene costo. El orden sugerido es por tiempo de aprobación:
**YouTube** anda casi al toque, **Instagram** te lleva medio día, **TikTok**
es el que tarda (revisión manual) — arrancalo primero y dejalo corriendo en
paralelo mientras hacés los otros dos.

---

## 1. TikTok — Content Posting API (arrancar primero, tarda más)

1. Creá una cuenta en https://developers.tiktok.com/ con el mismo mail/cuenta
   de @codigonegocioia (o una de admin, da igual).
2. "Manage apps" → "Connect an app" → creá una app nueva. Anotá el
   **Client Key** y el **Client Secret** (van en `TIKTOK_CLIENT_KEY` /
   `TIKTOK_CLIENT_SECRET` de tu `.env`).
3. Agregá el producto **Content Posting API** y pedí los scopes
   `video.publish` y `video.upload`.
4. Mientras la app no esté auditada ("unaudited"/sandbox), solo podés
   publicar a cuentas de TikTok que agregues como *testers* en el portal, y
   los videos se suben como privados (`SELF_ONLY`) — es justo lo que dejé
   seteado por defecto en `publish/tiktok.py`, así podés probar el flujo
   completo sin esperar la aprobación.
5. Para publicar públicamente en @codigonegocioia necesitás pasar
   **App Review**: TikTok pide un video demo del flujo completo (grabá tu
   pantalla usando el dashboard mientras publicás un video de prueba), una
   política de privacidad publicada (puede ser una página simple) y una
   descripción del caso de uso ("canal de contenido de negocios/IA que
   publica shorts diarios generados con IA"). El tiempo de aprobación
   históricamente varía entre días y semanas — mandalo y seguí con lo demás.
6. Una vez aprobada, implementá el login OAuth de TikTok para generar el
   `TIKTOK_ACCESS_TOKEN` de la cuenta @codigonegocioia (el código de
   `publish/tiktok.py` ya asume que ese token existe en `.env`).

**Estado en el que podés dejarlo hoy:** app creada, Content Posting API
pedida, App Review enviado, probando en modo `SELF_ONLY`.

---

## 2. YouTube — YouTube Data API v3 (el más rápido)

1. Andá a https://console.cloud.google.com/ y creá un proyecto nuevo (ej:
   `codigonegocioia-content`).
2. "APIs & Services" → "Library" → buscá **YouTube Data API v3** →
   habilitala.
3. "APIs & Services" → "OAuth consent screen": tipo **External**, completá
   nombre de la app y tu mail. En "Test users" agregá tu propia cuenta de
   Google (la que administra el canal @codigonegocioia).
4. "APIs & Services" → "Credentials" → "Create Credentials" → **OAuth
   client ID** → tipo **Desktop app**. Descargá el JSON.
5. Guardá ese JSON como `secrets/youtube_client_secret.json` (la ruta ya
   está en `.env.example` como `YOUTUBE_CLIENT_SECRETS_FILE`).
6. Instalá las dos libs que le faltan a `publish/youtube.py`:
   `pip install google-api-python-client google-auth-oauthlib`
7. La primera vez que llames a `publish.youtube.upload(...)` se abre el
   navegador para que autorices tu cuenta; el token queda cacheado en
   `YOUTUBE_TOKEN_FILE` y las próximas subidas no piden loguearse de nuevo.

**Importante — mientras la app esté en modo "Testing":** como el scope
`youtube.upload` es sensible, Google puede pedirte re-autenticar cada 7
días si la app no está verificada. Si te molesta, más adelante podés mandar
la app a verificación de Google (piden un video demo del consent screen y
una política de privacidad pública); para uso propio con un solo canal no
es obligatorio, solo una molestia menor.

**Estado en el que podés dejarlo hoy:** completamente funcional para vos
mismo, sin esperar aprobación de nadie.

---

## 3. Instagram — Graph API (Content Publishing)

1. Pasá la cuenta de Instagram @codigonegocioia a **cuenta profesional**
   (Configuración → Cuenta → Cambiar a cuenta profesional → Business o
   Creator, cualquiera de las dos sirve).
2. Vinculá esa cuenta a una **Página de Facebook** (Meta lo exige aunque no
   vayas a usar la página para nada más — se hace desde la configuración de
   la cuenta de Instagram o desde Meta Business Suite).
3. Creá una cuenta de developer en https://developers.facebook.com/ y una
   **App nueva** de tipo "Business".
4. Agregá el producto **Instagram** (Graph API / "Instagram Platform" —
   Meta le cambió el nombre un par de veces, buscalo como "Content
   Publishing" dentro del panel de la app).
5. Completá los datos básicos de la app (ícono, política de privacidad)
   aunque sea de forma mínima — los pide para el App Review más adelante.
6. Con el **Graph API Explorer**, generá un token de usuario pidiendo los
   permisos `instagram_basic`, `instagram_content_publish`,
   `pages_show_list` y `pages_read_engagement`. Canjealo por un token de
   **larga duración** (60 días) con el endpoint de intercambio de tokens.
7. Con ese token: `GET /me/accounts` te da el ID de tu Página de Facebook;
   con ese ID, `GET /{page-id}?fields=instagram_business_account` te da el
   **Instagram Business Account ID** (`IG_BUSINESS_ACCOUNT_ID`). El token
   de larga duración va en `IG_ACCESS_TOKEN`.
8. Mientras la app esté en modo **Development**, solo vos (como admin de la
   app) podés publicar — alcanza para arrancar. Para que la automatización
   corra sin que la toques vos, más adelante conviene pasar **App Review**
   (piden un video demo del flujo de publicación).
9. **Limitación que ya está resuelta en el código pero necesita tu acción**:
   la Graph API no acepta archivos locales, solo una **URL pública** del
   video. Necesitás un storage con URL pública para los mp4 antes de
   publicar — cualquiera de estos tiene tier gratis: Cloudflare R2, AWS S3,
   Google Cloud Storage. Subís el mp4 ahí y le pasás esa URL a
   `publish.instagram.upload_reel()`.
10. El token de 60 días hay que refrescarlo antes de que expire (Meta tiene
    un endpoint de refresh) — si automatizás la publicación diaria conviene
    automatizar también ese refresh.

**Estado en el que podés dejarlo hoy:** funcional para vos mismo en modo
Development, pendiente de resolver el storage con URL pública.

---

## Checklist

- [ ] TikTok: app creada, Content Posting API solicitada, App Review enviado
- [ ] YouTube: proyecto GCP creado, API habilitada, OAuth client descargado, primera subida de prueba hecha
- [ ] Instagram: cuenta profesional + página vinculada, app de Meta creada, token de larga duración generado, `IG_BUSINESS_ACCOUNT_ID` obtenido
- [ ] Instagram: storage con URL pública resuelto (R2/S3/GCS) para poder pasarle una URL a `upload_reel()`
- [ ] Las 4 credenciales completadas en tu `.env` (`TIKTOK_*`, `YOUTUBE_*`, `META_*`/`IG_*`)

Los menús exactos de Google Cloud Console, Meta for Developers y el portal
de TikTok cambian de tanto en tanto — si algún paso no coincide con lo que
ves en pantalla, buscá el nombre del producto/permiso mencionado acá, la
estructura general se mantiene aunque cambien las etiquetas.
