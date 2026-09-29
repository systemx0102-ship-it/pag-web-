#!/usr/bin/env node
/**
 * Protege una página con contraseña cifrándola (AES-256-GCM + PBKDF2).
 *
 * El archivo resultante solo contiene una pantalla de acceso y el
 * contenido cifrado: sin la contraseña no se puede leer ni el texto
 * ni el código de la página, aunque alguien consiga el archivo.
 *
 * Uso:
 *   SP_PASSWORD='tu-contraseña' node scripts/protect.mjs [entrada] [salida]
 *   (por defecto: dist/index.html → dist/index.html)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [, , input = 'dist/index.html', output = input] = process.argv;
const password = process.env.SP_PASSWORD;
if (!password || password.length < 8) {
  console.error('Define SP_PASSWORD con una contraseña de al menos 8 caracteres.');
  process.exit(1);
}

const ITERATIONS = 600000;
const html = readFileSync(input, 'utf8');
if (html.includes('id="sp-gate"')) {
  console.error(`${input} ya está protegido; genera primero la versión sin cifrar.`);
  process.exit(1);
}

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
);
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(html)));
const payload = Buffer.concat([salt, iv, cipher]).toString('base64');

// Reutiliza las tipografías incrustadas de la página para la pantalla de acceso.
const fonts = (html.match(/@font-face\s*{[^}]*(?:Cormorant|Manrope)[^}]*}/g) || [])
  .filter((f) => /Manrope|font-weight: 300; font-style: normal/.test(f.replace(/\s+/g, ' ')))
  .join('\n');

const gate = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="referrer" content="no-referrer">
<title>Acceso privado · SP FUMIGACION</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23080b0a'/%3E%3Cpath d='M16 4 L26 8 V15 C26 21.5 21.5 26 16 28 C10.5 26 6 21.5 6 15 V8 Z' fill='none' stroke='%234fd18b' stroke-width='2'/%3E%3C/svg%3E">
<style>
${fonts}
:root { --bg: #080b0a; --ink: #eef3ef; --ink-2: rgba(238,243,239,.62); --line: rgba(238,243,239,.14); --accent: #4fd18b; --accent-hi: #b9f3d0; --err: #e58a7a; }
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { display: grid; place-items: center; padding: 16px; background: radial-gradient(90% 70% at 50% 40%, #12201a 0%, var(--bg) 70%); color: var(--ink);
  font-family: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
.gate { width: min(420px, 100%); text-align: center; animation: rise 1.1s cubic-bezier(.16,1,.3,1) both; }
.gate svg { width: 58px; margin: 0 auto 22px; display: block; fill: none; stroke: var(--accent); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 16px rgba(79,209,139,.35)); }
.gate svg path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 1.4s .2s ease-in-out forwards; }
.gate svg path + path { stroke: var(--accent-hi); stroke-width: 2.2; animation-delay: .9s; }
.brand { font-weight: 700; font-size: .82rem; letter-spacing: .34em; }
h1 { margin: 22px 0 8px; font-family: "Cormorant", Georgia, serif; font-weight: 300; font-size: clamp(2.2rem, 7vw, 3rem); line-height: 1; }
p { margin: 0 0 28px; color: var(--ink-2); font-size: .92rem; }
form { display: grid; gap: 14px; }
.field { position: relative; }
input { width: 100%; height: 54px; padding: 0 18px; border-radius: 999px; border: 1px solid var(--line); background: rgba(238,243,239,.04); color: var(--ink);
  font: inherit; font-size: 1rem; text-align: center; letter-spacing: .08em; outline: none; transition: border-color .3s, box-shadow .3s; }
input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(79,209,139,.12); }
button { height: 54px; border: 0; border-radius: 999px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; font-size: .85rem; letter-spacing: .06em; cursor: pointer; transition: background .3s, transform .2s; }
button:hover { background: var(--accent-hi); }
button:active { transform: scale(.98); }
button[disabled] { opacity: .6; cursor: progress; }
.msg { min-height: 1.3em; margin: 4px 0 0; font-size: .85rem; color: var(--err); }
.shake { animation: shake .45s; }
.leave { animation: leave .7s cubic-bezier(.83,0,.17,1) forwards; }
.foot { margin-top: 36px; font-size: .7rem; letter-spacing: .16em; text-transform: uppercase; color: rgba(238,243,239,.35); }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(24px); } }
@keyframes leave { to { opacity: 0; transform: scale(.96); filter: blur(6px); } }
@keyframes shake { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-delay: 0s !important; } }
</style>
</head>
<body>
<main class="gate" id="sp-gate">
  <svg viewBox="0 0 64 72" aria-hidden="true"><path pathLength="1" d="M32 3 L59 13 V33 C59 51 47 63 32 69 C17 63 5 51 5 33 V13 Z"/><path pathLength="1" d="M20 36 L29 45 L45 26"/></svg>
  <div class="brand">SP FUMIGACION</div>
  <h1>Acceso privado</h1>
  <p>Esta página está protegida. Ingresa la contraseña para continuar.</p>
  <form id="sp-form" autocomplete="off">
    <div class="field"><input id="sp-pass" type="password" placeholder="Contraseña" aria-label="Contraseña" required autofocus></div>
    <button type="submit" id="sp-btn">Entrar</button>
    <p class="msg" id="sp-msg" role="alert"></p>
  </form>
  <div class="foot">Contenido cifrado · AES-256</div>
</main>
<script>
(function () {
  var DATA = "${payload}";
  var ITER = ${ITERATIONS};
  var KEY = 'sp-gate-key';
  var form = document.getElementById('sp-form');
  var input = document.getElementById('sp-pass');
  var btn = document.getElementById('sp-btn');
  var msg = document.getElementById('sp-msg');
  var gate = document.getElementById('sp-gate');

  if (!window.crypto || !crypto.subtle) {
    msg.textContent = 'Este navegador no permite abrir la página protegida. Usa Chrome, Edge, Firefox o Safari actualizados.';
    btn.disabled = true;
    return;
  }

  function bytes(b64) { var s = atob(b64), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  var raw = bytes(DATA), salt = raw.slice(0, 16), iv = raw.slice(16, 28), body = raw.slice(28);

  function derive(pass) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
      });
  }
  function open(key, remember) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, body).then(function (plain) {
      if (remember) {
        crypto.subtle.exportKey('raw', key).then(function (k) {
          try { sessionStorage.setItem(KEY, btoa(String.fromCharCode.apply(null, new Uint8Array(k)))); } catch (e) {}
        });
      }
      var html = new TextDecoder().decode(plain);
      gate.classList.add('leave');
      setTimeout(function () { document.open(); document.write(html); document.close(); }, remember ? 650 : 0);
    });
  }

  // Si ya se entró en esta pestaña, no vuelve a pedir la contraseña.
  try {
    var saved = sessionStorage.getItem(KEY);
    if (saved) {
      crypto.subtle.importKey('raw', bytes(saved), 'AES-GCM', true, ['decrypt'])
        .then(function (k) { return open(k, false); })
        .catch(function () { sessionStorage.removeItem(KEY); });
    }
  } catch (e) {}

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Verificando…';
    derive(input.value)
      .then(function (k) { return open(k, true); })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Entrar';
        msg.textContent = 'Contraseña incorrecta.';
        form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
        input.select();
      });
  });
})();
</script>
</body>
</html>
`;

writeFileSync(output, gate);
console.log(`${output}: protegido (${Math.round(gate.length / 1024)} KB)`);
