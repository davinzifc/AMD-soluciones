import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { MotionService } from '../../../core/motion/motion.service';
import { onPassiveScroll } from '../../../core/motion/scroll-listener';

/** Hero storytelling parallax factor (design.md Motion plan, DD-015: 0.15–0.35; mockup ≈0.22). */
export const HERO_PARALLAX_FACTOR = 0.22;

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
 * T013 storytelling parallax (design.md Motion plan, DD-005/DD-015): a
 * decorative `.parallax-layer` translates by `scrollY * HERO_PARALLAX_FACTOR`
 * via the shared passive scroll listener — no GSAP. `MotionService` gates it
 * off entirely (transform cleared, never recomputed) under
 * `prefers-reduced-motion: reduce` (REQ-010).
 */
@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection implements AfterViewInit, OnDestroy {
  @ViewChild('parallaxLayer') private readonly parallaxLayer?: ElementRef<HTMLElement>;

  private readonly motion = inject(MotionService);
  private cleanupScroll?: () => void;

  ngAfterViewInit(): void {
    this.cleanupScroll = onPassiveScroll(() => this.updateParallax());
  }

  ngOnDestroy(): void {
    this.cleanupScroll?.();
  }

  private updateParallax(): void {
    const layer = this.parallaxLayer?.nativeElement;
    if (!layer) {
      return;
    }
    if (this.motion.reducedMotion()) {
      layer.style.transform = '';
      return;
    }
    layer.style.transform = `translate3d(0, ${window.scrollY * HERO_PARALLAX_FACTOR}px, 0)`;
  }
}
