# AUREA — Residencia de autor

Página web inmersiva para presentar una residencia de lujo. La animación sigue al scroll de principio a fin y muestra el exterior, el interior, la estructura completa, los planos y la ficha técnica.

## Recorrido

| # | Sección | Qué pasa al hacer scroll |
|---|---------|--------------------------|
| — | **Preloader** | Contador real (imágenes críticas + tipografías) y telón que se abre. |
| 01 | **Hero** | La palabra *AUREA* es una ventana recortada sobre la foto; al bajar, el zoom atraviesa la «R» y revela la imagen completa. |
| — | **Manifiesto** | Cada palabra se enciende al ritmo del scroll; imágenes flotantes en parallax. |
| 02 | **Exterior** (características externas) | Recorrido horizontal fijado: fachada, piscina, jardines, terrazas, garaje y seguridad, con parallax interno y revelado por máscara. |
| — | **Umbral** | Un arco se abre sobre la fachada y el interior invade la pantalla. |
| 03 | **Interior** (características internas) | Imagen fija que se reescribe ambiente a ambiente (salón, cocina, suite, baños, biblioteca, cine). |
| 04 | **Estructura completa** | Axonometría SVG generada por código: se traza, se despieza por niveles (cimentación → cubierta), destaca cada nivel y se vuelve a ensamblar. |
| 05 | **Planos** | Planta baja y planta alta dibujadas con el scroll, con cuadro de áreas interactivo (hover sincronizado plano ↔ tabla). |
| 06 | **Ficha técnica** | Contadores animados y tabla por categorías: externas, internas, estructura y sistemas. |
| 07 | **Galería** | Una imagen a pantalla completa se reduce hasta formar una rejilla de 9 fotos. |
| 08 | **Contacto** | Formulario de visita privada con validación y botones magnéticos. |

Extras: scroll suave (Lenis), cursor personalizado, barra de progreso, indicador de sección, header que se oculta al bajar, menú móvil a pantalla completa, marquesina que reacciona a la velocidad del scroll y grano de película.

## Tecnología

- HTML, CSS y JavaScript sin paso de compilación.
- [GSAP](https://gsap.com) 3.15 + ScrollTrigger + SplitText y [Lenis](https://github.com/darkroomengineering/lenis) 1.3, **incluidos en `assets/vendor/`** (no dependen de un CDN).
- Tipografías auto-alojadas: Cormorant Garamond, Manrope y JetBrains Mono (SIL OFL).
- Fotografías reales de [Unsplash](https://unsplash.com), cargadas desde `images.unsplash.com`.

```
index.html
assets/
  css/styles.css     estilos, tokens y responsive
  js/main.js         coreografía de scroll, axonometría y planos
  vendor/            gsap, ScrollTrigger, SplitText, lenis
  fonts/             woff2 + licencias OFL
```

## Ejecutar en local

Hace falta un servidor estático (las fuentes no cargan con `file://` en algunos navegadores):

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Versión de un solo archivo

`dist/index.html` contiene toda la página en un único archivo (estilos, tipografías, librerías y scripts incrustados). Se abre con doble clic, sin servidor; solo las fotos se cargan desde internet.

Después de modificar `index.html` o cualquier archivo de `assets/`, regenérala con:

```bash
python3 scripts/build_standalone.py
```

## Publicar con GitHub Pages

*Settings → Pages → Deploy from a branch*, elegir la rama y la carpeta `/ (root)`. El archivo `.nojekyll` ya está incluido.

## Cambiar las fotos

Cada `<img>` apunta a una foto de Unsplash y declara respaldos en `data-fallback` (IDs separados por comas). Si una foto no carga, la página prueba la siguiente automáticamente; si ninguna carga, queda un degradado cálido con textura, sin romper el diseño.

```html
<img src="https://images.unsplash.com/photo-XXXXXXXX-XXXXXXXX?auto=format&fit=crop&w=1400&q=80"
     data-fallback="ID_ALTERNATIVO_1,ID_ALTERNATIVO_2" alt="…">
```

Para usar fotos propias, basta con reemplazar el `src` por la ruta local (por ejemplo `assets/img/fachada.jpg`) y quitar `data-fallback`.

## Accesibilidad y rendimiento

- Con `prefers-reduced-motion` se desactivan el scroll suave, los pines y las transiciones: todo el contenido queda visible y estático.
- Si el JavaScript no carga, la página sigue siendo legible (el preloader se retira solo).
- Navegación por teclado en pestañas (flechas ←/→), enlace «Saltar al contenido», textos alternativos en todas las fotos.
- Imágenes fuera de la primera pantalla con `loading="lazy"`.

## Créditos y licencias

- GSAP: [licencia estándar de GreenSock](https://gsap.com/standard-license) (uso gratuito).
- Lenis: MIT (`assets/vendor/LICENSE-lenis.txt`).
- Tipografías: SIL Open Font License 1.1 (`assets/fonts/OFL-*.txt`).
- Fotografías: licencia de Unsplash.
- AUREA es un proyecto conceptual: nombre, ubicación y cifras son ilustrativos.
