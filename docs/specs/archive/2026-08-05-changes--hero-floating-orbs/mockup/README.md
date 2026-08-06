# Mockup — Ambient orbs v0.4

Visual + reusable API for `docs/specs/changes/hero-floating-orbs`.

**HITL preferred (locked defaults):** count **8** · size **300–560px** · duration **~16s**

**Technique:** [Mamboleoo BxMQYQ](https://codepen.io/Mamboleoo/pen/BxMQYQ) orbit + soft radial discs (no GSAP).

## Open

Open `index.html` in a browser. No build / CDN.

## Reusable API (mock → Angular)

```js
const field = AmbientOrbs.mount(hostEl, {
  count: 8,
  sizeMin: 300,
  sizeMax: 560,
  baseDuration: 16,
});

field.rebuild({ count: 4 });
field.setPaused(true);
field.destroy();
```

| File | Role |
|------|------|
| `ambient-orbs.js` | `AmbientOrbs.mount` / `rebuild` / `setPaused` / `destroy` |
| `ambient-orbs.css` | `.amd-ambient-orbs` / `.amd-ambient-orb` |
| `hero-orbs.*` | HITL demo page only (chrome + sliders) |

### Drop into any background

1. Host: `position: absolute; inset: 0` inside a `position: relative` section.
2. Include `ambient-orbs.css` + `ambient-orbs.js`.
3. `AmbientOrbs.mount(host, options)`.

### Angular target (specify / execute)

```html
<section class="some-dark-section">
  <app-ambient-orbs
    [count]="8"
    [sizeMin]="300"
    [sizeMax]="560"
    [durationSec]="16"
  />
  <!-- content -->
</section>
```

Suggested path: `client/src/app/core/ambient/ambient-orbs/` (shared, not hero-only).
