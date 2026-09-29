# SP FUMIGACION — Control de plagas y limpieza

Página web inmersiva para SP FUMIGACION: fumigación y control de plagas, desinfección y servicios de limpieza profesional. Las animaciones siguen al scroll de principio a fin, con desplazamiento suave y lento.

## Recorrido

| # | Sección | Qué pasa al hacer scroll |
|---|---------|--------------------------|
| — | **Preloader** | Contador real (imágenes críticas + tipografías) y telón que se abre. |
| 01 | **Hero** | Las letras *SP* son una ventana recortada sobre la foto; al bajar, el zoom atraviesa la «P» y revela la imagen. |
| — | **Compromiso** | Cada palabra se enciende al ritmo del scroll. |
| 02 | **Fumigación** | Recorrido horizontal: cucarachas, roedores, termitas, chinches, mosquitos, hormigas/arañas/alacranes y aves. |
| — | **Transición** | Un arco se abre: del control de plagas a la limpieza. |
| 03 | **Limpieza** | Imagen fija que cambia por servicio: hogares, oficinas, desinfección, tanques, tapicería y post-obra. |
| 04 | **Método** | Axonometría de una vivienda que se separa por zonas de tratamiento (perímetro, cocina, dormitorios, techos) con las fases inspección → diagnóstico → tratamiento → garantía. |
| 05 | **Mapa de tratamiento** | Plano de ejemplo dibujado con el scroll, con el tratamiento de cada ambiente y las estaciones de cebo. |
| 06 | **Cifras** | Contadores y tabla por categorías: fumigación, limpieza, seguridad y garantía. |
| 07 | **Galería** | Una imagen a pantalla completa se reduce hasta formar una rejilla. |
| 08 | **Contacto** | Formulario de inspección gratuita con selector de servicio. |

> Las cifras (años, servicios, garantía, tiempos) y los textos son de ejemplo: ajústalos a los datos reales de la empresa. El formulario no envía datos a ningún servidor todavía.

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
- Las fotos son de Unsplash (espacios de ejemplo); lo ideal es reemplazarlas por fotos reales de los trabajos de SP FUMIGACION.
