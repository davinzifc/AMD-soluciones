/*
 * AMD Soluciones — Home redesign mockup (vanilla)
 *
 * El código de este archivo es DESECHABLE: sirve para evaluar el diseño en el
 * navegador. En producción cada bloque se mapea a Angular:
 *   buildOrbs()   → <app-ambient-orbs /> (ya existe, sin cambios)
 *   ledger()      → ServicesLedgerSection (signals + @for)
 *   reveal()/spy()→ una directiva compartida (IntersectionObserver)
 *   band()        → un componente con MotionService inyectado
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Campo de orbes — puerto 1:1 de AmbientOrbsComponent.buildOrbs() ───── */
  var ORB_COLORS = [
    'rgba(207, 187, 102, 0.42)',
    'rgba(229, 213, 154, 0.32)',
    'rgba(45, 58, 70, 0.55)',
  ];
  var rnd = function (min, max) { return min + Math.random() * (max - min); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  function buildOrbs(host) {
    var count = parseInt(host.dataset.orbsCount || '8', 10);
    var base = 16;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var size = rnd(300, 560);
      var dur = rnd(base * 0.85, base * 1.55) + base * 0.35;
      var orb = document.createElement('span');
      orb.className = 'orb';
      orb.style.width = size + 'px';
      orb.style.height = size + 'px';
      orb.style.top = rnd(5, 75) + '%';
      orb.style.left = rnd(5, 75) + '%';
      orb.style.background = 'radial-gradient(circle at 50% 50%, ' + pick(ORB_COLORS) + ' 0%, transparent 68%)';
      orb.style.filter = 'blur(' + Math.max(18, size * 0.12) + 'px)';
      orb.style.transformOrigin = rnd(-22, 22) + 'vw ' + rnd(-22, 22) + 'vh';
      orb.style.animationDuration = dur + 's';
      orb.style.animationDelay = -rnd(0, dur) + 's';
      orb.style.animationPlayState = reduced ? 'paused' : 'running';
      frag.appendChild(orb);
    }
    host.appendChild(frag);
  }
  document.querySelectorAll('[data-orbs]').forEach(buildOrbs);

  /* ── Ledger: hover/focus "is-hot" + acordeón ───────────────────────────── */
  var lines = Array.prototype.slice.call(document.querySelectorAll('.line'));

  lines.forEach(function (line) {
    var btn = line.querySelector('.line__btn');

    var hot = function (on) {
      return function () {
        // en móvil el revelado va atado a is-open, no al puntero
        if (window.innerWidth <= 760) return;
        line.classList.toggle('is-hot', on);
      };
    };
    line.addEventListener('mouseenter', hot(true));
    line.addEventListener('mouseleave', hot(false));
    btn.addEventListener('focus', hot(true));
    btn.addEventListener('blur', hot(false));

    // Acordeón EXCLUSIVO: abrir una cierra la anterior. Mantiene la altura
    // de la sección estable y deja siempre una sola línea "activa".
    btn.addEventListener('click', function () {
      var willOpen = !line.classList.contains('is-open');

      lines.forEach(function (other) {
        if (other === line) return;
        other.classList.remove('is-open');
        if (window.innerWidth <= 760) other.classList.remove('is-hot');
        other.querySelector('.line__btn').setAttribute('aria-expanded', 'false');
      });

      line.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
      if (window.innerWidth <= 760) line.classList.toggle('is-hot', willOpen);
    });
  });

  /* Primera línea abierta al cargar — da a entender que las filas se expanden */
  if (lines[0]) {
    lines[0].classList.add('is-open');
    lines[0].querySelector('.line__btn').setAttribute('aria-expanded', 'true');
  }

  /* ── Spine: la barra dorada se llena con el scroll del ledger ──────────── */
  var spine = document.querySelector('[data-spine]');
  var body = document.querySelector('.ledger__body');

  function paintSpine() {
    if (!spine || !body) return;
    var r = body.getBoundingClientRect();
    var vh = window.innerHeight;
    var progress = (vh * 0.72 - r.top) / r.height;
    spine.style.height = Math.max(0, Math.min(1, progress)) * 100 + '%';
  }

  /* ── Reveal + scroll-spy + tema del sub-header ─────────────────────────── */
  document
    .querySelectorAll('.ledger__head, .line, .about__quote, .about__body, .pillars li, .band__inner, .quote, .contact__intro, .form')
    .forEach(function (el) { el.setAttribute('data-reveal', ''); });

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { revealIO.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  var nav = document.querySelector('.topnav');
  var subnav = document.querySelector('[data-subnav]');
  var spy2Links = Array.prototype.slice.call(document.querySelectorAll('[data-spy2]'));
  var hero = document.getElementById('inicio');
  // Tramos claros: [Nosotros → Cifras) y [Confianza → Contacto). La banda de
  // cifras es oscura, así que parte el rango en dos.
  // Override desde la página (la variante clara mueve el ledger a claro).
  var lightRanges = window.AMD_LIGHT_RANGES ||
    [['sobre-amd', 'cifras'], ['confianza', 'contacto']];
  // Las secciones salen del sub-header, que desde el 2026-09-06 es el único
  // índice del home: el rail lateral quedó descartado (HITL).
  var sections = spy2Links
    .map(function (a) { return document.getElementById(a.dataset.spy2); })
    .filter(Boolean);

  function isOnLight(y) {
    return lightRanges.some(function (r) {
      var from = document.getElementById(r[0]).offsetTop;
      var to = document.getElementById(r[1]).offsetTop;
      return y >= from && y < to;
    });
  }

  function spy() {
    var mid = window.scrollY + window.innerHeight * 0.42;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= mid) current = s; });

    // El nav y el sub-header están pegados arriba, pero no a la misma altura:
    // cada uno mide el fondo EN SU PROPIA posición (40 px y 100 px).
    if (nav) nav.classList.toggle('on-light', isOnLight(window.scrollY + 40));

    if (subnav) {
      // aparece al salir del hero, para no restarle impacto
      subnav.classList.toggle('is-on', window.scrollY > hero.offsetHeight - 120);
      subnav.classList.toggle('on-light', isOnLight(window.scrollY + 100));
      spy2Links.forEach(function (a) {
        a.classList.toggle('is-active', a.dataset.spy2 === current.id);
        if (a.classList.contains('is-active') && subnav.classList.contains('is-on')) {
          var box = subnav.querySelector('.subnav__inner');
          var r = a.getBoundingClientRect(), br = box.getBoundingClientRect();
          if (r.left < br.left || r.right > br.right) {
            box.scrollTo({ left: a.offsetLeft - 24, behavior: reduced ? 'auto' : 'smooth' });
          }
        }
      });
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { paintSpine(); spy(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ── Menú móvil (<900px) ──────────────────────────────────────────────── */
  var burger = document.querySelector('[data-burger]');
  var sheet = document.querySelector('[data-sheet]');

  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  }

  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = sheet.hidden;
      sheet.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    sheet.querySelectorAll('[data-sheet-close]').forEach(function (a) {
      a.addEventListener('click', closeSheet);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });
    // al pasar a un ancho donde el panel ya no aplica, se cierra solo
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) closeSheet();
    });
  }

  /* ── Banda de cifras: video de fondo, siempre en reproducción ─────────
     Sin control de play/pausa (decisión HITL): es un loop ambiental de
     fondo, no una pieza que el usuario venga a ver. Se mantienen dos
     salvaguardas que no son controles de UI:
       · se pausa fuera del viewport — ahorro de CPU/batería, no accesibilidad
       · `prefers-reduced-motion` lo deja en el póster, sin movimiento */
  var band = document.querySelector('[data-band]');
  var video = document.querySelector('[data-video]');

  if (band && video && !reduced) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            video.play().catch(function () { /* autoplay bloqueado → queda el póster */ });
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.2 }).observe(band);
    } else {
      video.play().catch(function () {});
    }
  }

  /* ── Cifras: conteo al entrar en pantalla (una sola vez) ──────────────── */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function runCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = pre + target + suf; return; }

    var t0 = null;
    var DUR = 1100;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCount(e.target);
        countIO.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  /* ── Ticker de sectores (texto, no "pills") ────────────────────────────── */
  var SECTORS = ['Comercio', 'Servicios profesionales', 'Salud', 'Construcción', 'Transporte',
                 'Educación', 'Manufactura', 'Tecnología', 'Agroindustria'];
  var track = document.querySelector('[data-ticker]');
  if (track) {
    var html = SECTORS.concat(SECTORS)
      .map(function (s) { return '<span>' + s + '</span>'; })
      .join('');
    track.innerHTML = html;
  }

  /* ── Muro de clientes: carrusel infinito ───────────────────────────────
     Dos detalles que un marquee necesita para no salir mal:

     1. La cinta se duplica EXACTA una vez y se desplaza el 50 %. La copia va
        `aria-hidden`, así que el lector de pantalla oye 13 empresas, no 26.
     2. La duración se calcula desde el ancho MEDIDO, no se fija en el CSS.
        Con una duración fija la cinta corre más rápido en móvil —mismo tiempo,
        menos recorrido— justo donde ya cuesta más leerla. */
  var clientsRail = document.querySelector('[data-clients]');
  if (clientsRail) {
    var clientsTrack = clientsRail.querySelector('.clients__track');
    var originals = Array.prototype.slice.call(clientsTrack.children);

    originals.forEach(function (li) {
      var copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      // el clon no debe anunciarse ni recibir foco
      copy.querySelectorAll('[role="img"]').forEach(function (el) { el.removeAttribute('role'); });
      clientsTrack.appendChild(copy);
    });

    var SPEED = 42;   // px por segundo — ritmo de lectura, no de scroll
    function tuneMarquee() {
      // se mide la MITAD, que es exactamente lo que recorre la animación
      var half = clientsTrack.scrollWidth / 2;
      clientsTrack.style.setProperty('--marquee-dur', Math.round(half / SPEED) + 's');
    }
    tuneMarquee();
    window.addEventListener('resize', tuneMarquee);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tuneMarquee);
  }

  /* ── Testimonios ───────────────────────────────────────────────────────── */
  var QUOTES = [
    ['“Pasamos de improvisar cada cierre a tener un calendario y cifras que el banco acepta sin preguntas.”', '— Gerente, comercio · Cali'],
    ['“Nos formalizaron la nómina y la seguridad social en un mes. Dejamos de perder noches en eso.”', '— Socia fundadora, servicios · Palmira'],
    ['“El acompañamiento en riesgo nos abrió la puerta a clientes que antes nos exigían certificaciones.”', '— Director de operaciones, transporte · Yumbo'],
  ];
  var qEl = document.querySelector('[data-quote] p');
  var qCap = document.querySelector('.quote figcaption');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.quote__dots button'));

  function showQuote(i) {
    if (!qEl) return;
    qEl.style.opacity = '0';
    setTimeout(function () {
      qEl.textContent = QUOTES[i][0];
      if (qCap) qCap.textContent = QUOTES[i][1];
      qEl.style.opacity = '1';
    }, reduced ? 0 : 220);
    dots.forEach(function (d, j) { d.setAttribute('aria-selected', String(i === j)); });
  }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { showQuote(i); }); });
})();
