/**
 * HITL demo page — mounts reusable AmbientOrbs into the hero host.
 * Preferred values locked from HITL: count 8 · 300–560px · ~16s
 */
(function () {
  const FACTOR = 0.22;

  const layer = document.getElementById('parallaxLayer');
  const host = document.getElementById('orbHost');
  const toggle = document.getElementById('toggle-motion');
  const reshuffleBtn = document.getElementById('reshuffle');

  const countSlider = document.getElementById('count-slider');
  const sizeMinSlider = document.getElementById('size-min-slider');
  const sizeMaxSlider = document.getElementById('size-max-slider');
  const speedSlider = document.getElementById('speed-slider');

  const countOut = document.getElementById('count-readout');
  const sizeMinOut = document.getElementById('size-min-readout');
  const sizeMaxOut = document.getElementById('size-max-readout');
  const speedOut = document.getElementById('speed-readout');

  if (!window.AmbientOrbs || !host) {
    console.error('[mock] AmbientOrbs failed to load');
    return;
  }

  const field = window.AmbientOrbs.mount(host, window.AmbientOrbs.defaults);

  function reduced() {
    return (
      document.body.classList.contains('mock-reduced-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function updateParallax() {
    if (!layer) return;
    if (reduced()) {
      layer.style.transform = '';
      return;
    }
    layer.style.transform = `translate3d(0, ${window.scrollY * FACTOR}px, 0)`;
  }

  function readConfig() {
    let sizeMin = Number(sizeMinSlider.value);
    let sizeMax = Number(sizeMaxSlider.value);
    if (sizeMin > sizeMax) {
      [sizeMin, sizeMax] = [sizeMax, sizeMin];
      sizeMinSlider.value = String(sizeMin);
      sizeMaxSlider.value = String(sizeMax);
    }
    return {
      count: Number(countSlider.value),
      sizeMin,
      sizeMax,
      baseDuration: Number(speedSlider.value),
    };
  }

  function syncReadouts(cfg) {
    if (countOut) countOut.textContent = String(cfg.count);
    if (sizeMinOut) sizeMinOut.textContent = `${cfg.sizeMin}px`;
    if (sizeMaxOut) sizeMaxOut.textContent = `${cfg.sizeMax}px`;
    if (speedOut) speedOut.textContent = `~${cfg.baseDuration}s`;
  }

  function rebuildFromSliders() {
    const cfg = readConfig();
    syncReadouts(cfg);
    field.rebuild(cfg);
    field.setPaused(reduced());
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();

  toggle?.addEventListener('click', () => {
    const on = !document.body.classList.contains('mock-reduced-motion');
    document.body.classList.toggle('mock-reduced-motion', on);
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Motion ON (quitar simulación)' : 'Simular reduced-motion';
    updateParallax();
    field.setPaused(on || reduced());
  });

  [countSlider, sizeMinSlider, sizeMaxSlider, speedSlider].forEach((el) => {
    el?.addEventListener('input', rebuildFromSliders);
  });

  reshuffleBtn?.addEventListener('click', rebuildFromSliders);

  syncReadouts(field.getOptions());
  field.setPaused(reduced());
})();
