#!/usr/bin/env python3
"""Genera dist/index.html: la página completa en un solo archivo.

Incrusta la hoja de estilos, las tipografías (base64), las librerías
de assets/vendor y assets/js/main.js dentro de index.html, para poder
abrirla con doble clic o compartirla como un único archivo.

Uso:  python3 scripts/build_standalone.py
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "index.html"
SCRIPTS = [
    "assets/vendor/gsap.min.js",
    "assets/vendor/ScrollTrigger.min.js",
    "assets/vendor/SplitText.min.js",
    "assets/vendor/lenis.min.js",
    "assets/js/main.js",
]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def inline_fonts(css):
    # Manrope declara la misma fuente dos veces (variations + woff2): basta una.
    css = re.sub(
        r'url\("([^"]+manrope[^"]+)"\) format\("woff2-variations"\),\s*url\("\1"\) format\("woff2"\)',
        r'url("\1") format("woff2")',
        css,
    )

    def to_data(match):
        font = (ROOT / "assets" / "css" / match.group(1)).resolve()
        data = base64.b64encode(font.read_bytes()).decode("ascii")
        return f'url("data:font/woff2;base64,{data}")'

    return re.sub(r'url\("(\.\./fonts/[^"]+\.woff2)"\)', to_data, css)


def safe_script(js):
    # Evita que una cadena "</script" cierre la etiqueta antes de tiempo.
    return js.replace("</script", "<\\/script")


def main():
    html = read("index.html")

    html = re.sub(r'\s*<link rel="preload" href="assets/fonts/[^>]+>', "", html)
    css = inline_fonts(read("assets/css/styles.css"))
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/styles.css">',
        "<style>\n" + css + "\n</style>",
    )

    for rel in SCRIPTS:
        tag = f'<script src="{rel}"></script>'
        if tag not in html:
            raise SystemExit(f"No se encontró {tag} en index.html")
        html = html.replace(tag, f"<script>/* {rel} */\n" + safe_script(read(rel)) + "\n</script>")

    leftovers = re.findall(r'(?:src|href)="assets/[^"]+"', html)
    if leftovers:
        raise SystemExit(f"Quedaron referencias locales: {leftovers}")

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
