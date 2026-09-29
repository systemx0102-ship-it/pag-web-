/* ==========================================================================
   SP FUMIGACION — Control de plagas y limpieza
   Coreografía de scroll: GSAP + ScrollTrigger + SplitText + Lenis
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const NS = 'http://www.w3.org/2000/svg';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

  // Si las librerías no cargan, la página queda estática y legible.
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('is-loading');
    const loader = $('.loader');
    if (loader) loader.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out' });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------------
     Scroll suave (Lenis) sincronizado con el ticker de GSAP
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.75, touchMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const scrollToTarget = (target) => {
    const el = typeof target === 'string' ? (target === '#inicio' ? 0 : $(target)) : target;
    if (el === null) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.8, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
    } else {
      const top = el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  /* ------------------------------------------------------------------------
     Preloader: contador real (imágenes críticas + tipografías)
     ------------------------------------------------------------------------ */
  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('.loader');
      if (!loader || reduceMotion) {
        if (loader) loader.remove();
        resolve();
        return;
      }

      const num = $('.loader__num');
      const bar = $('.loader__bar i');
      const letters = $$('.loader__brand span');
      const critical = $$('img[data-critical]');
      const total = critical.length + 1;
      let done = 0;
      let target = 0;
      const bump = () => { done = Math.min(total, done + 1); target = done / total; };

      critical.forEach((img) => {
        if ((img.complete && img.naturalWidth) || img.classList.contains('is-broken')) { bump(); return; }
        const once = () => {
          img.removeEventListener('load', once);
          img.removeEventListener('fallbackexhausted', once);
          bump();
        };
        img.addEventListener('load', once);
        img.addEventListener('fallbackexhausted', once);
      });
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(bump);
      setTimeout(() => { target = 1; }, 4500);

      gsap.from(letters, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.06 });
      gsap.to('.loader__shield path', { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.55 });
      gsap.from('.loader__caption, .loader__foot', { opacity: 0, y: 12, duration: 1, delay: 0.3 });

      const start = performance.now();
      const state = { p: 0 };
      let leaving = false;

      const tick = () => {
        const elapsed = (performance.now() - start) / 1000;
        const goal = Math.min(target, Math.min(1, elapsed / 1.7));
        state.p += (goal - state.p) * 0.09;
        if (goal === 1 && state.p > 0.996) state.p = 1;
        num.textContent = String(Math.round(state.p * 100)).padStart(3, '0');
        bar.style.transform = `scaleX(${state.p})`;
        if (state.p === 1 && !leaving) {
          leaving = true;
          gsap.ticker.remove(tick);
          exit();
        }
      };
      gsap.ticker.add(tick);

      const exit = () => {
        gsap.timeline({ onComplete: () => loader.remove() })
          .to(letters, { yPercent: -110, duration: 0.8, ease: 'expo.in', stagger: 0.045 })
          .to('.loader__shield', { scale: 0.6, opacity: 0, duration: 0.7, ease: 'expo.in' }, '<')
          .to('.loader__caption, .loader__foot', { opacity: 0, duration: 0.4 }, '<')
          .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'expo.inOut' }, '-=0.2')
          .call(resolve, null, '-=0.85');
      };
    });
  }

  /* ------------------------------------------------------------------------
     Utilidades de revelado
     ------------------------------------------------------------------------ */
  function initSplitHeadings() {
    $$('[data-split]').forEach((el) => {
      if (reduceMotion || !window.SplitText) return;
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.4,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        }),
      });
    });
  }

  function initFades() {
    if (reduceMotion) return;
    const groups = [
      '.section-head .eyebrow',
      '.section-head .lead',
      '.manifesto__sign',
      '.contact__meta > div',
      '.contact__form',
      '.footer__top > *',
      '.plans__legend',
    ];
    $$(groups.join(',')).forEach((el) => {
      if (el.closest('.hs-track')) return;
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });
  }

  function initParallax() {
    if (reduceMotion) return;
    $$('[data-speed]').forEach((el) => {
      const s = parseFloat(el.dataset.speed) || 0;
      gsap.fromTo(el,
        { y: () => -s * window.innerHeight * 0.5 },
        {
          y: () => s * window.innerHeight * 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
    });
  }

  /* ------------------------------------------------------------------------
     01 · HERO — la palabra SP como ventana que se abre
     ------------------------------------------------------------------------ */
  function heroOrigin() {
    // Mide el trazo vertical de la «P» para que el zoom atraviese la letra.
    const pin = $('.hero__pin');
    const text = $('.hero__mask-text');
    const probe = document.createElementNS(NS, 'svg');
    probe.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;visibility:hidden;pointer-events:none');
    const clone = text.cloneNode(true);
    probe.appendChild(clone);
    pin.appendChild(probe);
    let origin = '50% 50%';
    try {
      const r = clone.getExtentOfChar(1);
      if (r && r.width) origin = `${r.x + r.width * 0.22}px ${r.y + r.height * 0.52}px`;
    } catch (e) { /* se mantiene el centro */ }
    probe.remove();
    return origin;
  }

  function initHero() {
    if (reduceMotion) return;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=260%',
        pin: '.hero__pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to('.hero__ui', { opacity: 0, y: -50, duration: 0.25, ease: 'power1.in' }, 0)
      .fromTo('.hero__mask',
        { scale: 1, transformOrigin: heroOrigin },
        { scale: () => (isMobile() ? 30 : 26), transformOrigin: heroOrigin, duration: 1, ease: 'power3.in', force3D: true }, 0)
      .to('.hero__mask', { opacity: 0, duration: 0.25 }, 0.7)
      .fromTo('.hero__media', { scale: 1.25 }, { scale: 1, duration: 1.1, ease: 'power2.out' }, 0)
      .to('.hero__shade', { opacity: 1, duration: 0.35 }, 0.85)
      .fromTo('.hero__reveal > *', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, 0.95)
      .to({}, { duration: 0.25 });
  }

  function initFog() {
    const canvas = $('.hero__fog');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const sg = sprite.getContext('2d');
    const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(205, 245, 222, 0.30)');
    grad.addColorStop(0.5, 'rgba(120, 205, 160, 0.10)');
    grad.addColorStop(1, 'rgba(120, 205, 160, 0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);

    const SCALE = 0.5; // se dibuja a media resolución: la niebla es difusa
    const mouse = { x: -1e4, y: -1e4 };
    const parts = [];
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = Math.max(1, Math.round(canvas.offsetWidth * SCALE));
      h = canvas.height = Math.max(1, Math.round(canvas.offsetHeight * SCALE));
    };
    resize();
    window.addEventListener('resize', resize);
    const count = isMobile() ? 16 : 30;
    for (let i = 0; i < count; i += 1) {
      const bvx = (Math.random() - 0.5) * 0.3;
      parts.push({
        x: Math.random() * w,
        y: h * (0.2 + Math.random() * 0.9),
        r: (0.18 + Math.random() * 0.32) * Math.max(w, h),
        bvx,
        vx: bvx,
        vy: -(0.06 + Math.random() * 0.16),
        a: 0.35 + Math.random() * 0.65,
      });
    }
    $('.hero__pin').addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * SCALE;
      mouse.y = (e.clientY - r.top) * SCALE;
    }, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        const reach = p.r * 0.9;
        if (d2 < reach * reach) {
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * 0.35;
          p.y += (dy / d) * 0.6;
        }
        p.vx += (p.bvx - p.vx) * 0.03;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -p.r) { p.y = h + p.r; p.x = Math.random() * w; }
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      });
    };
    let running = false;
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive && !running) { gsap.ticker.add(tick); running = true; }
        if (!self.isActive && running) { gsap.ticker.remove(tick); running = false; }
      },
    });
  }

  function initSeal() {
    if (reduceMotion || !$('.seal__ring')) return;
    gsap.to('.seal__ring', {
      rotation: 540,
      ease: 'none',
      transformOrigin: '50% 50%',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.6 },
    });
  }

  function heroIntro() {
    if (reduceMotion) return;
    gsap.timeline()
      .from('.hero__mask', { yPercent: 6, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0)
      .from('.hero__media img', { scale: 1.45, duration: 2.6, ease: 'expo.out' }, 0)
      .from('.hero__top > *, .hero__bottom > *', { y: 40, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, 0.35)
      .from('.site-header', { yPercent: -100, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity' }, 0.5);
  }

  /* ------------------------------------------------------------------------
     MANIFIESTO — cada palabra se enciende al ritmo del scroll
     ------------------------------------------------------------------------ */
  function initManifesto() {
    const text = $('.manifesto__text');
    if (!text || reduceMotion || !window.SplitText) return;
    const split = SplitText.create(text, { type: 'words', wordsClass: 'w' });
    gsap.fromTo(split.words, { opacity: 0.1 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: true },
    });
  }

  /* ------------------------------------------------------------------------
     02 · EXTERIOR — recorrido horizontal con parallax interno
     ------------------------------------------------------------------------ */
  function addScanners() {
    $$('.hs-panel').forEach((panel) => {
      const media = $('.hs-panel__media', panel);
      const name = ($('h3', panel) || {}).textContent || '';
      const scan = document.createElement('div');
      scan.className = 'scan';
      scan.setAttribute('aria-hidden', 'true');
      scan.innerHTML = '<span class="scan__corner scan__corner--tl"></span><span class="scan__corner scan__corner--tr"></span>'
        + '<span class="scan__corner scan__corner--bl"></span><span class="scan__corner scan__corner--br"></span>'
        + '<span class="scan__line"></span><span class="scan__tag"><i></i>Objetivo · ' + name + '</span>';
      media.appendChild(scan);
      if (reduceMotion) media.classList.add('is-scanned');
    });
  }

  function initExterior() {
    addScanners();
    if (reduceMotion) return;
    const track = $('.hs-track');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.exterior',
        start: 'top top',
        end: () => '+=' + distance() * 1.6,
        pin: '.exterior__pin',
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    gsap.to('.hs-progress__bar i', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.exterior', start: 'top top', end: () => '+=' + distance() * 1.6, scrub: true, invalidateOnRefresh: true },
    });

    $$('.hs-panel').forEach((panel) => {
      const media = $('.hs-panel__media', panel);
      const img = $('img', panel);
      ScrollTrigger.create({
        trigger: panel,
        containerAnimation: move,
        start: 'left 62%',
        onEnter: () => media.classList.add('is-scanned'),
        onLeaveBack: () => media.classList.remove('is-scanned'),
      });
      gsap.fromTo(media, { clipPath: 'inset(14% 10% 14% 10%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 100%', end: 'left 40%', scrub: true },
      });
      gsap.fromTo(img, { xPercent: -9 }, {
        xPercent: 9,
        ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from($$('.hs-panel__body > *', panel), {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 72%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.from('.hs-outro__big', {
      xPercent: 30,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hs-outro', containerAnimation: move, start: 'left right', end: 'left 40%', scrub: true },
    });
  }

  /* ------------------------------------------------------------------------
     UMBRAL — un arco se abre y el interior invade la pantalla
     ------------------------------------------------------------------------ */
  function initThreshold() {
    if (reduceMotion) return;
    const startClip = () => (isMobile()
      ? 'inset(30% 22% 16% 22% round 999px 999px 0px 0px)'
      : 'inset(22% 38% 14% 38% round 999px 999px 0px 0px)');

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.threshold',
        start: 'top top',
        end: '+=280%',
        pin: '.threshold__pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
      .fromTo('.threshold__inner', { clipPath: startClip }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', duration: 1, ease: 'power2.inOut',
      }, 0)
      .fromTo('.threshold__inner img', { scale: 1.45 }, { scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo('.threshold__outer img', { scale: 1 }, { scale: 1.7, duration: 1, ease: 'power2.in' }, 0)
      .to('.threshold__copy--in', { opacity: 0, y: -80, duration: 0.3, ease: 'power1.in' }, 0.1)
      .fromTo('.threshold__copy--out', { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.82)
      .to({}, { duration: 0.35 });

    gsap.from('.threshold__copy--in > *', {
      y: 60,
      opacity: 0,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.threshold', start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }

  /* ------------------------------------------------------------------------
     03 · INTERIOR — imagen fija que se reescribe ambiente a ambiente
     ------------------------------------------------------------------------ */
  function initInterior() {
    const figs = $$('.interior__img');
    const rooms = $$('.room');
    const counter = $('.interior__current');
    let current = 0;

    const setRoom = (i) => {
      if (i === current) return;
      current = i;
      rooms.forEach((r, k) => r.classList.toggle('is-active', k === i));
      counter.textContent = String(i + 1).padStart(2, '0');
      if (reduceMotion) figs.forEach((f, k) => { f.style.opacity = k === i ? 1 : 0; });
    };

    if (reduceMotion) figs.forEach((f, k) => { f.style.opacity = k === 0 ? 1 : 0; });

    rooms.forEach((room, i) => {
      ScrollTrigger.create({
        trigger: room,
        start: () => (isMobile() ? 'top 75%' : 'top center'),
        end: () => (isMobile() ? 'bottom 75%' : 'bottom center'),
        invalidateOnRefresh: true,
        onToggle: (self) => { if (self.isActive) setRoom(i); },
      });

      if (reduceMotion || i === 0) return;
      const st = () => ({
        trigger: room,
        start: () => (isMobile() ? 'top bottom' : 'top 95%'),
        end: () => (isMobile() ? 'top 70%' : 'top 38%'),
        scrub: true,
        invalidateOnRefresh: true,
      });
      gsap.fromTo(figs[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st() });
      gsap.fromTo($('img', figs[i]), { scale: 1.3, yPercent: 8 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: st() });
      gsap.fromTo($('img', figs[i - 1]), { scale: 1, yPercent: 0 }, { scale: 1.12, yPercent: -6, ease: 'none', immediateRender: false, scrollTrigger: st() });
    });
  }

  /* ------------------------------------------------------------------------
     04 · ESTRUCTURA — axonometría explotada generada en SVG
     ------------------------------------------------------------------------ */
  const LEVELS = [
    { code: 'Zona 1 · Barrera', name: 'Perímetro y subsuelo', offset: 78 },
    { code: 'Zona 2 · Aspersión', name: 'Cocina y áreas comunes', offset: 0 },
    { code: 'Zona 3 · Nebulización', name: 'Dormitorios y baños', offset: -86 },
    { code: 'Zona 4 · Sellado', name: 'Techos y áticos', offset: -160 },
  ];

  function buildAxo(svg) {
    const C = Math.cos(Math.PI / 6);
    const S = 0.5;
    const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
    const r1 = (n) => Math.round(n * 10) / 10;
    const make = (tag, attrs, parent) => {
      const node = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
      if (parent) parent.appendChild(node);
      return node;
    };
    const d = (list, close) => list.map((p, i) => (i ? 'L' : 'M') + P(...p).map(r1).join(',')).join(' ') + (close ? ' Z' : '');
    const face = (g, list, cls, fo) => make('path', { d: d(list, true), class: `f ${cls || ''}`.trim(), 'data-fo': fo, pathLength: 1 }, g);
    const edge = (g, a, b, cls = 'e') => make('path', { d: d([a, b]), class: cls, pathLength: 1 }, g);

    const box = (g, x0, x1, y0, y1, z0, z1, cls = '', o = {}) => {
      const { top = 0.14, left = 0.06, right = 0.1, hidden = true, skipTop = false } = o;
      if (hidden) {
        edge(g, [x0, y0, z0], [x1, y0, z0], 'e-hidden');
        edge(g, [x0, y0, z0], [x0, y1, z0], 'e-hidden');
        edge(g, [x0, y0, z0], [x0, y0, z1], 'e-hidden');
      }
      face(g, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], cls, left);
      face(g, [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]], cls, right);
      if (!skipTop) face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], cls, top);
    };

    const world = make('g', { class: 'axo-world' }, svg);
    const groups = LEVELS.map((lv, i) => make('g', { class: 'lvl', 'data-level': i }, world));
    const [gF, gB, gA, gR] = groups;

    // Cimentación: pilotes, losa y vigas de amarre
    [15, 75, 135].forEach((y) => [20, 80, 140, 200, 250].forEach((x) => {
      edge(gF, [x, y, -12], [x, y, -56], 'e e-thin');
      edge(gF, [x - 5, y, -56], [x + 5, y, -56], 'e e-thin');
    }));
    box(gF, 0, 260, 0, 150, -12, 0, '', { top: 0.12, left: 0.08, right: 0.12 });
    [15, 75, 135].forEach((y) => edge(gF, [0, y, 0], [260, y, 0], 'e e-thin'));
    [20, 80, 140, 200, 250].forEach((x) => edge(gF, [x, 0, 0], [x, 150, 0], 'e e-thin'));

    // Planta baja: losa, volumen acristalado, pilares, tabiques, terraza y piscina
    box(gB, 0, 260, 0, 150, 0, 5, '', { top: 0.12, left: 0.1, right: 0.14 });
    face(gB, [[130, 0, 52], [130, 92, 52], [130, 92, 5], [130, 0, 5]], '', 0.05);
    face(gB, [[180, 92, 52], [260, 92, 52], [260, 92, 5], [180, 92, 5]], '', 0.05);
    [[65, 75], [130, 75], [195, 75]].forEach(([x, y]) => edge(gB, [x, y, 5], [x, y, 52], 'e'));
    box(gB, 0, 260, 0, 150, 5, 52, 'glass', { top: 0, left: 0.07, right: 0.1, skipTop: true });
    for (let x = 26; x < 260; x += 26) edge(gB, [x, 150, 5], [x, 150, 52], 'e e-thin');
    for (let y = 25; y < 150; y += 25) edge(gB, [260, y, 5], [260, y, 52], 'e e-thin');
    box(gB, 0, 260, 150, 196, 0, 2, '', { top: 0.07, left: 0.05, right: 0.05, hidden: false });
    box(gB, 30, 214, 204, 236, -6, 0, 'water', { top: 0.34, left: 0.18, right: 0.2, hidden: false });

    // Planta alta: volumen en voladizo con cercha
    box(gA, 60, 320, 0, 130, 52, 58, '', { top: 0.12, left: 0.1, right: 0.14 });
    face(gA, [[180, 0, 100], [180, 130, 100], [180, 130, 58], [180, 0, 58]], '', 0.05);
    box(gA, 60, 320, 0, 130, 58, 100, 'glass', { top: 0, left: 0.07, right: 0.1, skipTop: true });
    for (let x = 86; x < 260; x += 26) edge(gA, [x, 130, 58], [x, 130, 100], 'e e-thin');
    for (let y = 26; y < 130; y += 26) edge(gA, [320, y, 58], [320, y, 100], 'e e-thin');
    [[260, 290], [290, 320]].forEach(([a, b], k) => {
      edge(gA, [a, 130, k ? 100 : 58], [b, 130, k ? 58 : 100], 'e');
    });
    edge(gA, [260, 130, 58], [260, 130, 100], 'e');

    // Cubierta: losa, paneles solares y pérgola
    box(gR, 60, 320, 0, 130, 100, 106, '', { top: 0.12, left: 0.1, right: 0.14 });
    for (let x = 176; x <= 290; x += 26) {
      for (let y = 12; y <= 100; y += 28) {
        face(gR, [[x, y, 107], [x + 22, y, 107], [x + 22, y + 20, 113], [x, y + 20, 113]], 'solar', 0.55);
      }
    }
    [[72, 12], [152, 12], [72, 118], [152, 118]].forEach(([x, y]) => edge(gR, [x, y, 106], [x, y, 130], 'e'));
    edge(gR, [72, 12, 130], [152, 12, 130], 'e');
    edge(gR, [72, 118, 130], [152, 118, 130], 'e');
    for (let x = 72; x <= 152; x += 10) edge(gR, [x, 12, 130], [x, 118, 130], 'e e-thin');

    // Etiquetas con línea guía (se mueven con cada nivel)
    const anchors = [[260, 0, -6], [260, 0, 28], [320, 0, 79], [320, 0, 106]];
    groups.forEach((g, i) => {
      const [ax, ay] = P(...anchors[i]);
      const lbl = make('g', { class: 'lbl' }, g);
      const lx = 330;
      make('circle', { cx: r1(ax), cy: r1(ay), r: 2.2 }, lbl);
      make('line', { x1: r1(ax), y1: r1(ay), x2: lx, y2: r1(ay) }, lbl);
      const code = make('text', { x: lx + 8, y: r1(ay - 5), class: 'lbl-code' }, lbl);
      code.textContent = LEVELS[i].code.toUpperCase();
      const name = make('text', { x: lx + 8, y: r1(ay + 14), class: 'lbl-name' }, lbl);
      name.textContent = LEVELS[i].name;
    });

    const fitView = () => {
      // Mide siempre la maqueta ensamblada para que el encuadre no salte.
      const ys = groups.map((g) => gsap.getProperty(g, 'y'));
      gsap.set(groups, { y: 0 });
      const bb = world.getBBox();
      groups.forEach((g, i) => gsap.set(g, { y: ys[i] }));
      const up = Math.abs(LEVELS[3].offset);
      const down = LEVELS[0].offset;
      const pad = 14;
      svg.setAttribute('viewBox', [bb.x - pad, bb.y - up - pad, bb.width + pad * 2, bb.height + up + down + pad * 2].map(r1).join(' '));
    };
    fitView();

    return { groups, fitView };
  }

  function initStructure() {
    const svg = $('#axo');
    if (!svg) return;
    const { groups, fitView } = buildAxo(svg);
    const strokes = $$('.f, .e', svg);
    const faces = $$('.f', svg);
    const hidden = $$('.e-hidden', svg);
    const labels = $$('.lbl', svg);
    const cards = $$('.level-card');
    const levelItems = $$('.level');
    const phases = $$('.phase');

    ScrollTrigger.addEventListener('refreshInit', fitView);

    if (reduceMotion) {
      faces.forEach((f) => { f.style.fillOpacity = f.dataset.fo; });
      hidden.forEach((h) => { h.style.opacity = 0.35; });
      groups.forEach((g, i) => gsap.set(g, { y: LEVELS[i].offset }));
      cards.forEach((c) => c.classList.add('is-active'));
      return;
    }

    gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });

    let lastPhase = -1;
    let lastKey = 'intro';
    const setCard = (key) => {
      if (key === lastKey) return;
      lastKey = key;
      cards.forEach((c) => c.classList.toggle('is-active', c.dataset.card === String(key)));
      const lvl = typeof key === 'number' ? key : -1;
      svg.classList.toggle('has-focus', lvl >= 0);
      groups.forEach((g, i) => g.classList.toggle('is-active', i === lvl));
      levelItems.forEach((li) => li.classList.toggle('is-active', key === 'all' || Number(li.dataset.level) === lvl));
    };
    const setPhase = (p) => {
      if (p === lastPhase) return;
      lastPhase = p;
      phases.forEach((ph, i) => {
        ph.classList.toggle('is-active', i === p);
        ph.classList.toggle('is-done', i < p);
      });
    };

    let tl = null;
    function sync() {
      if (!tl || tl.labels.assemble === undefined) return;
      const t = tl.time();
      const { explode, levels, assemble } = tl.labels;
      if (t < explode) setPhase(0);
      else if (t < levels) setPhase(1);
      else if (t < assemble) setPhase(2);
      else setPhase(3);

      if (t >= levels && t < assemble) setCard(Math.min(3, Math.floor(t - levels)));
      else if (t >= assemble + 0.4) setCard('all');
      else setCard('intro');
    }

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.structure',
        start: 'top top',
        end: () => '+=' + window.innerHeight * (isMobile() ? 6 : 7.5),
        pin: '.structure__pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
      onUpdate: sync,
    });

    // Fase 1 · Trazado (de la cimentación a la cubierta)
    tl.to(strokes, { strokeDashoffset: 0, duration: 1, stagger: { amount: 1.1 } }, 0)
      .to(faces, { fillOpacity: (i, el) => el.dataset.fo, duration: 0.6, stagger: { amount: 0.5 } }, 1.0)
      .to(hidden, { opacity: 0.35, duration: 0.4 }, 1.4);

    // Fase 2 · Despiece
    tl.addLabel('explode', 2.2);
    groups.forEach((g, i) => tl.to(g, { y: LEVELS[i].offset, duration: 1, ease: 'power3.inOut' }, 'explode'));
    tl.to(labels, { opacity: 1, duration: 0.35, stagger: 0.12 }, 'explode+=0.75');

    // Fase 3 · Niveles (uno por uno, de abajo hacia arriba)
    tl.addLabel('levels', 'explode+=1.4');
    tl.to({}, { duration: 4 }, 'levels');

    // Fase 4 · Ensamblaje
    tl.addLabel('assemble');
    groups.forEach((g) => tl.to(g, { y: 0, duration: 1, ease: 'power3.inOut' }, 'assemble'));
    tl.to(labels, { opacity: 0, duration: 0.3 }, 'assemble');
    tl.to({}, { duration: 0.6 });
    sync();
  }

  /* ------------------------------------------------------------------------
     05 · PLANOS — dibujo técnico que se traza con el scroll
     ------------------------------------------------------------------------ */
  const M2 = 0.035 * 0.035; // 1 unidad del plano = 3,5 cm
  const TREATMENT = {
    'Salón doble altura': 'Aspersión',
    Comedor: 'Aspersión',
    Cocina: 'Gel + cebo',
    'Cine privado': 'Nebulización',
    Bodega: 'Cebo roedores',
    Servicio: 'Gel + cebo',
    'Suite huéspedes': 'Vapor chinches',
    Aseo: 'Desinfección',
    Escalera: 'Aspersión',
    'Hall de acceso': 'Aspersión',
    'Vacío doble altura': '—',
    'Suite principal': 'Vapor chinches',
    Vestidor: 'Nebulización',
    'Baño principal': 'Desinfección',
    'Suite 2': 'Vapor chinches',
    'Baño 2': 'Desinfección',
    'Estudio y biblioteca': 'Antitermitas',
    'Suite 3': 'Vapor chinches',
  };
  const PLANS = {
    pb: {
      stamp: 'Planta baja · N0',
      baits: [[-24, 60], [-24, 420], [220, 504], [560, 504], [944, 300], [944, 460], [944, 60], [700, -24]],
      rooms: [
        ['Salón doble altura', 0, 0, 400, 280],
        ['Comedor', 400, 0, 200, 280],
        ['Cocina', 600, 0, 320, 200],
        ['Cine privado', 600, 200, 160, 280],
        ['Bodega', 760, 200, 160, 130],
        ['Servicio', 760, 330, 160, 150],
        ['Suite huéspedes', 0, 280, 220, 200],
        ['Aseo', 220, 280, 120, 100],
        ['Escalera', 220, 380, 120, 100, 'stair'],
        ['Hall de acceso', 340, 280, 260, 200],
      ],
      windows: [['h', 30, 370, 0], ['h', 430, 570, 0], ['h', 640, 880, 0], ['v', 40, 240, 0], ['v', 310, 450, 0],
        ['v', 30, 170, 920], ['v', 360, 450, 920], ['h', 30, 190, 480], ['h', 790, 890, 480]],
      gaps: [['v', 60, 150, 600]],
      doors: [
        [420, 480, 50, 'up', 'r'], [520, 480, 50, 'up', 'l'],
        [350, 280, 42, 'down', 'r'], [340, 292, 38, 'left', 'd'],
        [600, 470, 42, 'right', 'u'], [220, 440, 38, 'left', 'u'],
        [920, 440, 38, 'left', 'u'], [800, 200, 38, 'down', 'r'],
      ],
      furniture: (f) => {
        f.rect(40, 160, 36, 100); f.rect(76, 224, 150, 36); f.rect(120, 160, 80, 44);
        f.circle(300, 110, 26); f.circle(300, 110, 16);
        f.rect(448, 80, 104, 160);
        [100, 145, 190].forEach((y) => { f.rect(428, y, 14, 26); f.rect(558, y, 14, 26); });
        f.rect(660, 104, 200, 44); f.rect(620, 14, 280, 26); f.rect(890, 44, 22, 140);
        f.line(614, 216, 746, 216);
        [320, 370, 420].forEach((y) => [620, 664, 708].forEach((x) => f.rect(x, y, 34, 30)));
        [230, 270, 310].forEach((y) => f.line(776, y, 904, y));
        f.rect(776, 346, 44, 44); f.rect(826, 346, 44, 44);
        f.rect(22, 316, 118, 132); f.rect(28, 322, 48, 22); f.rect(86, 322, 48, 22);
        f.ellipse(300, 346, 14, 18); f.rect(236, 290, 60, 18);
        f.circle(470, 380, 30);
      },
      extras: (x) => {
        x.ext(0, -84, 920, 84, 'Terraza');
        x.pool(100, -200, 700, 92, 'Piscina infinita · 25 m');
      },
    },
    pa: {
      stamp: 'Planta alta · N+1',
      baits: [[-24, 380], [944, 220], [944, 420]],
      rooms: [
        ['Vacío doble altura', 0, 0, 400, 280, 'void'],
        ['Suite principal', 400, 0, 300, 280],
        ['Vestidor', 700, 0, 220, 120],
        ['Baño principal', 700, 120, 220, 160],
        ['Suite 2', 0, 280, 220, 200],
        ['Baño 2', 220, 280, 120, 100],
        ['Escalera', 220, 380, 120, 100, 'stair'],
        ['Estudio y biblioteca', 340, 280, 260, 200],
        ['Suite 3', 600, 280, 320, 200],
      ],
      windows: [['h', 430, 670, 0], ['h', 30, 370, 0], ['v', 310, 450, 0], ['v', 150, 260, 920],
        ['v', 310, 450, 920], ['h', 30, 190, 480], ['h', 380, 560, 480], ['h', 640, 880, 480]],
      gaps: [],
      doors: [
        [420, 280, 40, 'up', 'r'], [700, 60, 36, 'left', 'd'], [700, 180, 36, 'left', 'd'],
        [220, 440, 38, 'left', 'u'], [340, 292, 38, 'left', 'd'], [600, 460, 40, 'right', 'u'],
        [360, 380, 40, 'down', 'r'],
      ],
      furniture: (f) => {
        f.line(0, 0, 400, 280); f.line(400, 0, 0, 280);
        f.rect(480, 60, 160, 150); f.rect(490, 68, 64, 24); f.rect(566, 68, 64, 24);
        f.rect(446, 70, 26, 26); f.rect(648, 70, 26, 26);
        [20, 40, 60, 80, 100].forEach((y) => f.line(716, y, 740, y));
        f.rect(724, 190, 150, 64, 30); f.rect(850, 132, 56, 50); f.rect(712, 132, 24, 50);
        f.rect(26, 318, 116, 132); f.rect(32, 324, 46, 22); f.rect(90, 324, 46, 22);
        f.rect(236, 292, 70, 34, 14); f.ellipse(316, 352, 12, 16);
        f.rect(390, 312, 150, 46); f.circle(465, 380, 14); f.rect(356, 458, 228, 12);
        f.rect(700, 320, 140, 130); f.rect(708, 328, 58, 24); f.rect(774, 328, 58, 24); f.rect(860, 380, 44, 70);
      },
      extras: (x) => {
        x.ext(400, -64, 300, 64, 'Terraza suite');
      },
    },
  };

  function initPlans() {
    const svg = $('#plan');
    if (!svg) return;
    const list = $('.plans__rooms');
    const totalEl = $('.plans__total:not(.plans__baits) b');
    const baitsEl = $('.plans__baits b');
    const stampLevel = $('.plans__stamp-level');
    const OX = 60;
    const OY = 250;
    let drawTween = null;

    const make = (tag, attrs, parent) => {
      const node = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
      if (parent) parent.appendChild(node);
      return node;
    };
    const rectD = (x, y, w, h, r = 0) => (r
      ? `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${w - 2 * r} a${r},${r} 0 0 1 -${r},-${r} v-${h - 2 * r} a${r},${r} 0 0 1 ${r},-${r} Z`
      : `M${x},${y} h${w} v${h} h-${w} Z`);
    const ellD = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1 0 ${rx * 2},0 a${rx},${ry} 0 1 0 -${rx * 2},0 Z`;
    const draw = (g, d, cls) => make('path', { d, class: `${cls} d`, pathLength: 1 }, g);
    const text = (g, x, y, cls, str) => { const t = make('text', { x, y, class: cls }, g); t.textContent = str; return t; };
    const fmt = (n) => n.toFixed(1).replace('.', ',');

    function doorD(hx, hy, r, dir, swing) {
      // Hoja de puerta + arco de giro
      const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
      const s = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[swing];
      const leaf = [hx + v[0] * r, hy + v[1] * r];
      const closed = [hx + s[0] * r, hy + s[1] * r];
      const cross = v[0] * s[1] - v[1] * s[0];
      return `M${hx},${hy} L${leaf[0]},${leaf[1]} A${r},${r} 0 0 ${cross > 0 ? 1 : 0} ${closed[0]},${closed[1]}`;
    }

    function build(key) {
      const plan = PLANS[key];
      while (svg.lastChild && svg.lastChild.nodeName !== 'title') svg.removeChild(svg.lastChild);
      const g = make('g', { transform: `translate(${OX},${OY})` }, svg);
      const gExt = make('g', {}, g);
      const gFur = make('g', {}, g);
      const gIn = make('g', {}, g);
      const gOut = make('g', {}, g);
      const gOpen = make('g', {}, g);
      const gHit = make('g', {}, g);
      const gLbl = make('g', { class: 'plan-labels' }, g);
      const gDim = make('g', { class: 'plan-dims' }, svg);

      plan.extras({
        ext: (x, y, w, h, label) => {
          draw(gExt, rectD(x, y, w, h), 'ext');
          text(gLbl, x + w / 2, y + h / 2 + 7, 'rl-name', label);
        },
        pool: (x, y, w, h, label) => {
          draw(gExt, rectD(x, y, w, h), 'pool');
          for (let i = 1; i < 4; i += 1) {
            const yy = y + (h / 4) * i;
            let dd = `M${x + 20},${yy}`;
            for (let xx = x + 20; xx < x + w - 40; xx += 40) dd += ` q10,-6 20,0 t20,0`;
            draw(gExt, dd, 'wave');
          }
          text(gLbl, x + w / 2, y + h / 2 + 7, 'rl-name', label);
        },
      });

      const f = {
        rect: (x, y, w, h, r) => draw(gFur, rectD(x, y, w, h, r), 'fur'),
        circle: (cx, cy, r) => draw(gFur, ellD(cx, cy, r, r), 'fur'),
        ellipse: (cx, cy, rx, ry) => draw(gFur, ellD(cx, cy, rx, ry), 'fur'),
        line: (x1, y1, x2, y2) => draw(gFur, `M${x1},${y1} L${x2},${y2}`, 'fur'),
      };
      plan.furniture(f);

      let total = 0;
      let n = 0;
      list.innerHTML = '';
      plan.rooms.forEach(([name, x, y, w, h, type]) => {
        if (type === 'void') {
          draw(gIn, rectD(x, y, w, h), 'void');
        } else {
          draw(gIn, rectD(x, y, w, h), 'w-in');
        }
        if (type === 'stair') {
          for (let yy = y + 12; yy < y + h - 6; yy += 9) draw(gFur, `M${x + 12},${yy} L${x + w - 12},${yy}`, 'fur');
          draw(gFur, `M${x + w / 2},${y + h - 10} L${x + w / 2},${y + 16} M${x + w / 2 - 6},${y + 26} L${x + w / 2},${y + 16} L${x + w / 2 + 6},${y + 26}`, 'door');
        }
        const area = w * h * M2;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const isVoid = type === 'void';
        if (!isVoid) { total += area; n += 1; }
        const idx = isVoid ? '—' : String(n).padStart(2, '0');

        const hit = make('rect', { x, y, width: w, height: h, class: 'room-hit', 'data-room': idx }, gHit);
        if (type !== 'stair') {
          make('circle', { cx, cy: cy - 30, r: 15, class: 'rl-tag' }, gLbl);
          text(gLbl, cx, cy - 30, 'rl-num', idx);
          text(gLbl, cx, cy + 4, 'rl-name', name);
          text(gLbl, cx, cy + 24, 'rl-area', isVoid ? 'DOBLE ALTURA' : `${fmt(area)} M²`);
        } else {
          make('circle', { cx: x + 22, cy: y + 22, r: 13, class: 'rl-tag' }, gLbl);
          text(gLbl, x + 22, y + 22, 'rl-num', idx);
        }

        const li = document.createElement('li');
        li.dataset.room = idx;
        li.innerHTML = `<span>${idx}</span><span>${name}</span><span>${TREATMENT[name] || '—'}</span>`;
        list.appendChild(li);

        const on = () => { hit.classList.add('is-hover'); li.classList.add('is-hover'); };
        const off = () => { hit.classList.remove('is-hover'); li.classList.remove('is-hover'); };
        hit.addEventListener('pointerenter', on);
        hit.addEventListener('pointerleave', off);
        li.addEventListener('pointerenter', on);
        li.addEventListener('pointerleave', off);
      });

      // Muros exteriores, ventanas, aberturas y puertas
      draw(gOut, rectD(0, 0, 920, 480), 'w-out');
      plan.windows.forEach(([o, a, b, at]) => {
        if (o === 'h') {
          make('rect', { x: a, y: at - 5, width: b - a, height: 10, class: 'win-gap' }, gOpen);
          draw(gOpen, `M${a},${at - 3} L${b},${at - 3} M${a},${at + 3} L${b},${at + 3}`, 'win');
        } else {
          make('rect', { x: at - 5, y: a, width: 10, height: b - a, class: 'win-gap' }, gOpen);
          draw(gOpen, `M${at - 3},${a} L${at - 3},${b} M${at + 3},${a} L${at + 3},${b}`, 'win');
        }
      });
      plan.gaps.forEach(([o, a, b, at]) => {
        if (o === 'v') make('rect', { x: at - 3, y: a, width: 6, height: b - a, class: 'win-gap' }, gOpen);
        else make('rect', { x: a, y: at - 3, width: b - a, height: 6, class: 'win-gap' }, gOpen);
      });
      plan.doors.forEach(([hx, hy, r, dir, swing]) => {
        const s = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[swing];
        const x0 = Math.min(hx, hx + s[0] * r);
        const y0 = Math.min(hy, hy + s[1] * r);
        const horizontalWall = s[1] === 0;
        make('rect', horizontalWall
          ? { x: x0, y: hy - 5, width: r, height: 10, class: 'win-gap' }
          : { x: hx - 5, y: y0, width: 10, height: r, class: 'win-gap' }, gOpen);
        draw(gOpen, doorD(hx, hy, r, dir, swing), 'door');
      });

      // Cotas generales y norte
      const W = 920 * 0.035;
      const H = 480 * 0.035;
      const bx = OX;
      const by = OY + 480 + 36;
      draw(gDim, `M${bx},${by} L${bx + 920},${by} M${bx},${by - 8} L${bx},${by + 8} M${bx + 920},${by - 8} L${bx + 920},${by + 8}`, 'dim');
      text(gDim, bx + 460, by + 26, 'dim-t', `${fmt(W)} M`).setAttribute('text-anchor', 'middle');
      const rx = OX - 30;
      draw(gDim, `M${rx},${OY} L${rx},${OY + 480} M${rx - 8},${OY} L${rx + 8},${OY} M${rx - 8},${OY + 480} L${rx + 8},${OY + 480}`, 'dim');
      const vt = text(gDim, rx - 12, OY + 240, 'dim-t', `${fmt(H)} M`);
      vt.setAttribute('text-anchor', 'middle');
      vt.setAttribute('transform', `rotate(-90 ${rx - 12} ${OY + 240})`);
      draw(gDim, ellD(975, 64, 22, 22), 'north');
      draw(gDim, 'M975,46 L966,76 L975,68 L984,76 Z', 'north');
      text(gDim, 975, 108, 'north-t', 'N');

      (plan.baits || []).forEach(([bx, by]) => {
        draw(gOpen, rectD(bx - 9, by - 9, 18, 18), 'bait');
        draw(gOpen, `M${bx - 4},${by} L${bx + 4},${by} M${bx},${by - 4} L${bx},${by + 4}`, 'bait');
      });
      if (baitsEl) baitsEl.textContent = String((plan.baits || []).length);

      totalEl.textContent = `${Math.round(total)} m²`;
      stampLevel.textContent = plan.stamp;
      return svg;
    }

    function animate(fromScroll) {
      const strokes = $$('.d:not(.ext):not(.void)', svg);
      const labels = $$('.plan-labels, .plan-dims text, .d.ext, .d.void', svg);
      const openings = $$('.win-gap', svg);
      if (drawTween) {
        if (drawTween.scrollTrigger) drawTween.scrollTrigger.kill();
        drawTween.kill();
      }
      if (reduceMotion) return;

      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(labels, { opacity: 0 });
      gsap.set(openings, { opacity: 0 });
      drawTween = gsap.timeline(fromScroll ? {
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.plans__sheet', start: 'top 82%', end: 'center 48%', scrub: 1 },
      } : { defaults: { ease: 'power2.inOut' } });
      drawTween
        .to(openings, { opacity: 1, duration: 0.01 }, 0.15)
        .to(strokes, { strokeDashoffset: 0, duration: fromScroll ? 1 : 1.1, stagger: { amount: fromScroll ? 0.9 : 0.6 } }, 0)
        .to(labels, { opacity: 1, duration: 0.4, stagger: 0.05 }, fromScroll ? 1.3 : 0.9);
    }

    build('pb');
    animate(true);

    const tabs = $('.plans .tabs');
    initTabs(tabs, (btn) => {
      build(btn.dataset.plan);
      animate(false);
    });
  }

  /* ------------------------------------------------------------------------
     Pestañas accesibles con píldora animada
     ------------------------------------------------------------------------ */
  function initTabs(container, onChange) {
    if (!container) return;
    const buttons = $$('.tab', container);
    const pill = $('.tabs__pill', container);
    const place = () => {
      const active = buttons.find((b) => b.classList.contains('is-active')) || buttons[0];
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.height = `${active.offsetHeight}px`;
      pill.style.top = `${active.offsetTop}px`;
      pill.style.transform = `translateX(${active.offsetLeft - 5}px)`;
    };
    const select = (btn, focus) => {
      if (btn.classList.contains('is-active')) return;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      place();
      onChange(btn);
    };
    buttons.forEach((b, i) => {
      b.tabIndex = b.classList.contains('is-active') ? 0 : -1;
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(buttons[(i + dir + buttons.length) % buttons.length], true);
      });
    });
    place();
    window.addEventListener('resize', place);
    if (document.fonts) document.fonts.ready.then(place);
  }

  /* ------------------------------------------------------------------------
     06 · FICHA TÉCNICA — contadores y tabla por categorías
     ------------------------------------------------------------------------ */
  function initSpecs() {
    const format = (el, v) => {
      const dec = Number(el.dataset.decimals || 0);
      let s = v.toFixed(dec).replace('.', ',');
      if (el.dataset.format === 'thousands') s = String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return s;
    };
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      if (reduceMotion) { el.textContent = format(el, end); return; }
      const o = { v: 0 };
      gsap.to(o, {
        v: end,
        duration: 2.4,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = format(el, o.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    if (!reduceMotion) {
      gsap.from('.stat', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.stats', start: 'top 85%', toggleActions: 'play none none reverse' },
      });
      gsap.from('#sheet-ext .sheet__rows > div', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.sheet', start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }

    const tabs = $('.tabs--sheet');
    initTabs(tabs, (btn) => {
      $$('.sheet__panel').forEach((p) => {
        const on = p.id === btn.getAttribute('aria-controls');
        p.hidden = !on;
        p.classList.toggle('is-active', on);
        if (on && !reduceMotion) {
          gsap.fromTo($$('.sheet__rows > div', p), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05 });
        }
      });
      ScrollTrigger.refresh();
    });
  }

  /* ------------------------------------------------------------------------
     07 · GALERÍA — de pantalla completa a rejilla
     ------------------------------------------------------------------------ */
  function initGallery() {
    if (reduceMotion) return;
    const center = $('.g-item--center');
    const others = $$('.g-item:not(.g-item--center)');
    const cover = () => Math.max(window.innerWidth / center.offsetWidth, window.innerHeight / center.offsetHeight) * 1.08;

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.gallery',
        start: 'top top',
        end: '+=280%',
        pin: '.gallery__pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
      .to('.gallery__caption', { opacity: 0, y: -60, duration: 0.3, ease: 'power1.in' }, 0.05)
      .fromTo(center, { scale: cover }, { scale: 1, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo($('img', center), { scale: 1 }, { scale: 1.12, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(others, { opacity: 0, scale: 0.6 }, {
        opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', stagger: { each: 0.035, from: 'random' },
      }, 0.3)
      .to({}, { duration: 0.35 });
  }

  function initMarquee() {
    const rows = $$('.marquee__row');
    if (!rows.length || reduceMotion) return;
    let visible = false;
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => { visible = self.isActive; },
    });
    const state = rows.map((row, i) => ({
      row,
      x: 0,
      dir: i % 2 ? 1 : -1,
      setX: gsap.quickSetter(row, 'x', 'px'),
      setSkew: gsap.quickSetter(row, 'skewX', 'deg'),
    }));
    let skew = 0;
    gsap.ticker.add((time, delta) => {
      if (!visible) return;
      const v = lenis ? lenis.velocity : 0;
      const sign = v < -0.1 ? -1 : 1;
      skew += (gsap.utils.clamp(-8, 8, v * 0.35) - skew) * 0.1;
      state.forEach((s) => {
        const half = s.row.scrollWidth / 2;
        s.x += s.dir * sign * (0.9 + Math.abs(v) * 0.5) * (delta / 16.67);
        s.x = gsap.utils.wrap(-half, 0, s.x);
        s.setX(s.x);
        s.setSkew(skew * s.dir * -1);
      });
    });
  }

  /* ------------------------------------------------------------------------
     08 · CONTACTO + FOOTER
     ------------------------------------------------------------------------ */
  function initContact() {
    const form = $('.contact__form');
    const status = $('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.nombre;
      const email = form.elements.email;
      const okName = name.value.trim().length > 1;
      const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      name.closest('.field').classList.toggle('is-invalid', !okName);
      email.closest('.field').classList.toggle('is-invalid', !okMail);
      if (!okName || !okMail) {
        status.textContent = 'Revisa tu nombre y correo electrónico para continuar.';
        return;
      }
      const first = name.value.trim().split(/\s+/)[0];
      status.textContent = `Gracias, ${first}. Nuestro equipo te contactará en menos de 24 horas para confirmar tu visita privada.`;
      form.reset();
    });

    if (reduceMotion) return;
    gsap.from('.footer__giant span', {
      yPercent: 100,
      duration: 1.4,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', toggleActions: 'play none none reverse' },
    });
  }

  /* ------------------------------------------------------------------------
     UI global: header, menú móvil, progreso, HUD, navegación
     ------------------------------------------------------------------------ */
  function initChrome() {
    const header = $('[data-header]');
    const toggle = $('.menu-toggle');
    const menu = $('#mobile-menu');

    const setMenu = (open) => {
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      $('.sr-only', toggle).textContent = open ? 'Cerrar menú' : 'Abrir menú';
      if (lenis) (open ? lenis.stop() : lenis.start());
    };
    toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

    $$('[data-link]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        e.preventDefault();
        if (root.classList.contains('menu-open')) setMenu(false);
        scrollToTarget(href);
      });
    });

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('is-scrolled', y > 40);
        if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', self.direction === 1 && y > 320);
      },
    });

    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    const hud = $('.hud');
    const hudIndex = $('.hud__index');
    const hudLabel = $('.hud__label');
    const hudLine = $('.hud__line i');
    const navLinks = $$('.site-nav a');
    $$('[data-section]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return;
          hudIndex.textContent = sec.dataset.index;
          hudLabel.textContent = sec.dataset.section;
          hud.classList.toggle('is-visible', sec.id !== 'inicio');
          const id = sec.id || sec.dataset.nav;
          navLinks.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === `#${id}`));
        },
        onUpdate: (self) => { hudLine.style.transform = `scaleY(${self.progress.toFixed(3)})`; },
      });
    });
  }

  /* ------------------------------------------------------------------------
     Cursor personalizado + botones magnéticos (solo puntero fino)
     ------------------------------------------------------------------------ */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    root.classList.add('has-cursor');
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

    window.addEventListener('pointermove', (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      cursor.classList.remove('is-hidden');
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));

    document.addEventListener('pointerover', (e) => {
      const labelled = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .room-hit, .plans__rooms li');
      cursor.classList.toggle('is-label', !!labelled);
      cursor.classList.toggle('is-link', !labelled && !!link);
      if (labelled) label.textContent = labelled.dataset.cursor;
    });

    $$('.hs-panel__media, .interior__frame').forEach((el) => {
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.45);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ------------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------------ */
  // Los disparadores se crean en el orden del documento para que cada
  // sección fijada (pin) desplace correctamente a las siguientes.
  initHero();
  initFog();
  initManifesto();
  initExterior();
  initThreshold();
  initInterior();
  initStructure();
  initPlans();
  initSpecs();
  initGallery();
  initMarquee();
  initContact();
  initParallax();
  initSplitHeadings();
  initFades();
  initChrome();
  initCursor();
  initSeal();

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  runLoader().then(() => {
    root.classList.remove('is-loading');
    if (lenis) lenis.start();
    heroIntro();
    if (location.hash && $(location.hash)) setTimeout(() => scrollToTarget(location.hash), 600);
  });
})();
