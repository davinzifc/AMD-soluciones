/**
 * Passive `scroll` + `resize` window listener (T013 · DD-005: CSS + scroll
 * listener only — no GSAP). Mirrors the mockup `landing.js` pattern of one
 * `{ passive: true }` scroll subscription driving hero parallax, road deco
 * parallax, and the road progress fill, instead of a dedicated animation
 * library.
 *
 * Calls `handler` once immediately so consumers paint the correct state
 * without waiting for the first scroll/resize, then again on every
 * subsequent event until the returned cleanup function runs.
 */
export function onPassiveScroll(handler: () => void): () => void {
  if (typeof window === 'undefined') {
    return function noopCleanup(): void {
      /* no-op — nothing was attached in a non-browser environment */
    };
  }
  window.addEventListener('scroll', handler, { passive: true });
  window.addEventListener('resize', handler, { passive: true });
  handler();
  return () => {
    window.removeEventListener('scroll', handler);
    window.removeEventListener('resize', handler);
  };
}
