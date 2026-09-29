# SP FUMIGACION — Control de plagas y limpieza

Página web inmersiva para SP FUMIGACION: fumigación y control de plagas, desinfección y servicios de limpieza profesional. Las animaciones siguen al scroll de principio a fin, con desplazamiento suave y lento.

## Recorrido

| # | Sección | Qué pasa al hacer scroll |
|---|---------|--------------------------|
| — | **Preloader** | Contador real (imágenes críticas + tipografías) y telón que se abre. |
| 01 | **Hero** | Las letras *SP* son una ventana recortada sobre la foto; al bajar, el zoom atraviesa la «P» y revela la imagen. |
| — | **Compromiso** | Cada palabra se enciende al ritmo del scroll. |
| — | **Neutralización** | Animación de miles de partículas: una cucaracha se forma, es escaneada, se disuelve en niebla durante la fumigación y renace como el escudo de SP, con panel de infestación de 100 % a 0 %. Las partículas se apartan del cursor. |
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
- Fotografías reales de fumigación, plagas y limpieza de [Pexels](https://www.pexels.com) (`images.pexels.com`), con fotos de [Unsplash](https://unsplash.com) como último respaldo.

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

`dist/index.html` contiene toda la página en un único archivo (estilos, tipografías, librerías y scripts incrustados), protegido con contraseña. Se abre con doble clic, sin servidor; solo las fotos se cargan desde internet.

Después de modificar `index.html` o cualquier archivo de `assets/`, regenérala con:

```bash
python3 scripts/build_standalone.py
```

## Página privada (con contraseña)

`dist/index.html` se entrega **cifrado**: al abrirlo solo aparece una pantalla de acceso de SP FUMIGACION. El contenido va cifrado con AES-256-GCM y la clave se deriva de la contraseña (PBKDF2, 600.000 iteraciones), así que sin la contraseña no se puede leer la página ni su código, aunque alguien consiga el archivo. Una vez dentro, no la vuelve a pedir hasta cerrar la pestaña.

La contraseña **no** se guarda en el repositorio. Para regenerar el archivo, o cambiar la contraseña:

```bash
python3 scripts/build_standalone.py
SP_PASSWORD='tu-nueva-contraseña' node scripts/protect.mjs
```

Importante: esto protege el archivo `dist/index.html`. Los archivos fuente (`index.html`, `assets/`) están sin cifrar, así que el repositorio de GitHub debe ser **privado** (Settings → General → Danger Zone → Change repository visibility → Private). La página también incluye `noindex` para que los buscadores no la indexen.

## Publicar con GitHub Pages

*Settings → Pages → Deploy from a branch*, elegir la rama y la carpeta `/ (root)`. El archivo `.nojekyll` ya está incluido.

## Cambiar las fotos

Cada `<img>` apunta a una foto de Pexels y declara respaldos en `data-fallback`, separados por comas. Un ID solo con números es de Pexels (el número final de la dirección de la foto, por ejemplo `pexels.com/photo/…-4176412/`) y un ID con guion es de Unsplash. Si una foto no carga, la página prueba la siguiente automáticamente; si ninguna carga, queda un degradado con textura, sin romper el diseño.

```html
<img src="https://images.pexels.com/photos/4176412/pexels-photo-4176412.jpeg?auto=compress&cs=tinysrgb&w=1400"
     data-fallback="4099260,1600596542815-ffad4c1539a9" alt="…">
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
- Fotografías: licencias de Pexels y Unsplash (uso gratuito).
- Las fotos son de bancos de imágenes; lo ideal es ir sumando fotos reales de los trabajos de SP FUMIGACION.
