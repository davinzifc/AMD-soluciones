import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Home hero (T006 · REQ-003 · design.md §6 `HeroSection`): brand-first first
 * viewport. `AMD Soluciones` dominates, `Integrales S.A.S.` reads as the
 * legal sub-line, one promise sentence follows, then a primary/secondary CTA
 * pair. Deliberately **no** cards, stat strips, or floating badges — the
 * anti-pattern list in `docs/ux-ui/design.md` §6 and the REQ-003 scenario
 * forbid them in the first viewport.
 *
 * CTAs reuse the fragment contract already proven by `TopNav`'s Contactar
 * link (`routerLink="/" fragment="…"`, resolved by `withInMemoryScrolling`
 * in `app.config.ts`) instead of raw `href="#…"`, so Home's own in-page
 * anchors keep working when this component is later reused elsewhere.
 *
 * Parallax factors (design.md Motion plan, DD-015) are T013's job; this
 * section ships as a static atmosphere plane until then.
 */
@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection {}
