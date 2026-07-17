# Case Study · E-Commerce Manager — microsite `luise.pro/freshly`

Microsite de una sola página (long-scroll) con la versión completa del case study.
HTML + CSS + JS **vanilla**. Sin frameworks, sin build, sin npm, sin CDNs externos.
Funciona con doble clic en `index.html` y servido como estático. Rutas relativas en todo.

## Estructura

```
/freshly/
├── index.html
├── robots.txt                → Disallow: /freshly/
├── README.md
└── assets/
    ├── css/styles.css
    ├── js/main.js
    ├── pdf/Freshly_CaseStudy_Luise_Chancafe.pdf
    └── img/
```

## Ver en local

```bash
cd freshly
python3 -m http.server 8000    # http://localhost:8000
```

## Despliegue

Es un estático que vive como **subcarpeta `/freshly/` dentro del hosting actual de
`luise.pro`** (mismo servidor; no requiere subdominio ni DNS nuevo).

1. Subir la carpeta completa por **FTP/SFTP** a la raíz pública como `/freshly/`.
2. Verificar que el PDF quedó en `assets/pdf/`.
3. **robots.txt:** los crawlers solo leen el `robots.txt` de la raíz del dominio.
   Para que el `Disallow: /freshly/` surta efecto, añade esa línea al
   `robots.txt` que ya exista en la raíz de `luise.pro` (no bloquees la raíz).
   La protección real de indexación es el `<meta name="robots" content="noindex, nofollow">`,
   que ya va en el `<head>` de esta página.

## Imágenes: fotos de producto y capturas de GA4

El microsite trae **marcos de referencia en blanco** listos para que pegues las imágenes
reales cuando las tengas. No hace falta tocar el CSS, solo el HTML.

### Fotos de producto
En [`index.html`](index.html) busca los bloques `class="product__frame"`. Dentro hay un
comentario con el `<img>` ya preparado. Descoméntalo y apunta al archivo:

```html
<div class="product__frame">
  <div class="product__ph">…placeholder…</div>
  <img class="product__img" src="./assets/img/prod-golden-radiance.jpg" alt="Golden Radiance Body Oil" />
</div>
```
La imagen cubre el marco automáticamente (`object-fit: cover`). Deja los `.jpg`/`.png`
en [`assets/img/`](assets/img/). Producto ancla: `prod-golden-radiance.jpg`.

### Capturas de GA4
Busca los bloques `class="shot__frame"` (llevan el badge **GA4** y una leyenda de qué
capturar). Dentro hay un `<img class="shot__img">` comentado. Descoméntalo:

```html
<div class="shot__frame">
  <span class="shot__badge">GA4</span>
  <div class="shot__ph">…placeholder…</div>
  <img class="shot__img" src="./assets/img/ga4-embudo.png" alt="GA4 · embudo" />
</div>
```
Capturas sugeridas (nombres de archivo propuestos en `assets/img/`):
- `ga4-resumen-90d.png` — ingresos (15,25M€) y sesiones (8,86M) a 90 días.
- `ga4-embudo.png` — exploración de embudo view_item → add_to_cart → begin_checkout → purchase.
- `ga4-errores-js.png` — eventos `exception` y % de usuarios afectados (~12%).
- `ga4-dispositivo.png` — reparto por dispositivo (mobile 92% · desktop 6% · tablet 2%).

Mientras no exista el archivo, se ve el marco de referencia con su leyenda (no rompe nada).

## Privacidad

- `noindex, nofollow` en el `<head>`.
- `canonical` a `https://luise.pro/freshly/`.
- Sin analytics, sin cookies, sin trackers, sin recursos externos que filtren la URL.
- `<title>` sobrio sin nombre de empresa: "Case Study · E-Commerce Manager".
- El tema (claro/oscuro) NO usa localStorage/sessionStorage: solo variable de sesión en memoria.

## Checklist de aceptación

- [x] Arranca en dark; toggle sin localStorage.
- [x] 5 interactivos + todos los expandibles funcionando en móvil y teclado:
      1) Funnel PDP→carrito · 2) Flip cards de los 3 tests · 3) Simulador LTV/CAC ·
      4) Timeline de campaña · 5) Comparador PrestaShop/Shopify.
- [x] Simulador LTV/CAC con ratio indexado, rangos de mercado, disclaimer, sin euros.
- [x] Contenido completo (specs, benchmarks, tablas, cuadro de mando, Enero, tipos de
      decisión) dentro de expandibles; lo visible es la síntesis.
- [x] `noindex` + `robots` con Disallow solo de `/freshly/`. Sin glosario.
- [x] PDF descargable desde nav y cierre. Rutas relativas.

## Verificación final antes de publicar

- [ ] noindex activo y robots correcto (solo `/freshly/` bloqueado)
- [ ] PDF descarga desde nav y cierre
- [ ] 5 interactivos funcionan con ratón, teclado y tap
- [ ] Todos los expandibles abren y cierran
- [ ] Toggle arranca en oscuro
- [ ] Sin scroll horizontal a 360px
- [ ] Consola limpia
