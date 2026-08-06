/**
 * AmbientOrbs — reusable soft orbital bokeh field (AMD).
 * Technique: Mamboleoo BxMQYQ orbit (rotate + transform-origin) + radial blur discs.
 * Spec: docs/specs/changes/hero-floating-orbs
 *
 * Usage (any background container):
 *   const field = AmbientOrbs.mount(hostEl, { count: 8, sizeMin: 300, sizeMax: 560 });
 *   field.rebuild({ count: 4 });
 *   field.setPaused(true);
 *   field.destroy();
 */
(function (global) {
  const DEFAULTS = {
    count: 8,
    sizeMin: 300,
    sizeMax: 560,
    baseDuration: 16,
    colors: [
      'rgba(207, 187, 102, 0.42)', // --amd-gold
      'rgba(229, 213, 154, 0.32)', // --amd-gold-soft
      'rgba(45, 58, 70, 0.55)', // cool ink
    ],
    className: 'amd-ambient-orbs',
    orbClassName: 'amd-ambient-orb',
    respectReducedMotion: true,
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function normalizeOptions(options) {
    const cfg = { ...DEFAULTS, ...options };
    let { sizeMin, sizeMax } = cfg;
    if (sizeMin > sizeMax) {
      [sizeMin, sizeMax] = [sizeMax, sizeMin];
    }
    cfg.sizeMin = sizeMin;
    cfg.sizeMax = sizeMax;
    cfg.count = Math.max(1, Math.floor(cfg.count));
    cfg.baseDuration = Math.max(1, Number(cfg.baseDuration) || DEFAULTS.baseDuration);
    return cfg;
  }

  function createOrb(cfg) {
    const size = rand(cfg.sizeMin, cfg.sizeMax);
    const el = document.createElement('span');
    el.className = cfg.orbClassName;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.top = `${rand(5, 75)}%`;
    el.style.left = `${rand(5, 75)}%`;

    const color = pick(cfg.colors);
    el.style.background = `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 68%)`;
    el.style.filter = `blur(${Math.max(18, size * 0.12)}px)`;
    el.style.transformOrigin = `${rand(-22, 22)}vw ${rand(-22, 22)}vh`;

    const duration =
      rand(cfg.baseDuration * 0.85, cfg.baseDuration * 1.55) + cfg.baseDuration * 0.35;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${-rand(0, duration)}s`;

    return el;
  }

  /**
   * @param {HTMLElement} host - Absolute/relative container that fills the background
   * @param {Partial<typeof DEFAULTS>} [options]
   */
  function mount(host, options) {
    if (!host) {
      throw new Error('AmbientOrbs.mount(host): host element required');
    }

    let cfg = normalizeOptions(options);
    const root = document.createElement('div');
    root.className = cfg.className;
    root.setAttribute('aria-hidden', 'true');
    host.appendChild(root);

    let mqCleanup = null;

    function isPausedExternal() {
      return Boolean(cfg._paused);
    }

    function shouldPause() {
      if (isPausedExternal()) return true;
      if (cfg.respectReducedMotion && prefersReducedMotion()) return true;
      return false;
    }

    function applyPauseState() {
      root.classList.toggle('is-paused', shouldPause());
    }

    function rebuild(nextOptions) {
      if (nextOptions) {
        cfg = normalizeOptions({ ...cfg, ...nextOptions });
        root.className = cfg.className;
      }
      root.replaceChildren();
      for (let i = 0; i < cfg.count; i++) {
        root.appendChild(createOrb(cfg));
      }
      applyPauseState();
      return api.getOptions();
    }

    function setPaused(paused) {
      cfg._paused = Boolean(paused);
      applyPauseState();
    }

    function destroy() {
      mqCleanup?.();
      mqCleanup = null;
      root.remove();
    }

    if (cfg.respectReducedMotion) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => applyPauseState();
      mq.addEventListener('change', onChange);
      mqCleanup = () => mq.removeEventListener('change', onChange);
    }

    const api = {
      root,
      rebuild,
      setPaused,
      destroy,
      getOptions() {
        const { _paused, ...publicCfg } = cfg;
        return { ...publicCfg, paused: Boolean(_paused) };
      },
    };

    rebuild();
    return api;
  }

  global.AmbientOrbs = {
    defaults: { ...DEFAULTS },
    mount,
  };
})(typeof window !== 'undefined' ? window : globalThis);
