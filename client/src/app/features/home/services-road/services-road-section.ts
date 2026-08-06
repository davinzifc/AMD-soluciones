import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { MotionService } from '../../../core/motion/motion.service';
import { onPassiveScroll } from '../../../core/motion/scroll-listener';
import { SERVICE_GROUP_IDS } from '../../services/services-page/services-page';

type ServiceGroupId = (typeof SERVICE_GROUP_IDS)[number];

interface RoadGroup {
  readonly id: ServiceGroupId;
  readonly number: string;
  readonly titleKey: string;
  readonly summaryKey: string;
  readonly bodyKey: string;
}

/**
 * Five service groups (REQ-004; order per mockup `index.html` road + design.md
 * §3 `ServiceGroupId`). `id` is the single source of truth reused for both the
 * `aria-controls`/detail wiring here and the `/services#<id>` deep-link — kept
 * as the shared `SERVICE_GROUP_IDS` from the Servicios page stub (T005) so the
 * two features cannot drift on group ids.
 */
const GROUPS: readonly RoadGroup[] = [
  { id: 'contabilidad', number: '01', titleKey: 'g1Title', summaryKey: 'g1Sum', bodyKey: 'g1Body' },
  { id: 'administrativa', number: '02', titleKey: 'g2Title', summaryKey: 'g2Sum', bodyKey: 'g2Body' },
  { id: 'riesgo', number: '03', titleKey: 'g3Title', summaryKey: 'g3Sum', bodyKey: 'g3Body' },
  { id: 'asesoria', number: '04', titleKey: 'g4Title', summaryKey: 'g4Sum', bodyKey: 'g4Body' },
  { id: 'marca', number: '05', titleKey: 'g5Title', summaryKey: 'g5Sum', bodyKey: 'g5Body' },
];

/** Road ambient deco parallax factors, in DOM order (design.md Motion plan, DD-015: 0.08–0.14; mockup `data-road-parallax` parity). */
export const ROAD_DECO_FACTORS = [0.08, 0.14, 0.1] as const;

/**
 * Home services road (T007 · REQ-004 · design.md §6 `ServicesRoadSection` ·
 * DD-006). Renders the five groups as an accordion road: activating a
 * node/pill/card expands a short teaser detail plus a "Más info" deep-link to
 * `/services#<id>`. Only one group is open at a time (mockup `landing.js`
 * `toggleRoadItem` parity).
 *
 * REQ-012 / evidence disqualifier guard: expansion is wired through explicit
 * `(click)` and `(keydown)` (Enter/Space) handlers on the node, pill, and
 * card alike — never a CSS `:hover` rule — so pointer, keyboard, and touch
 * all reach the same `toggle()` path. `preventDefault()` on the keydown
 * handler cancels the browser's own Enter/Space-to-click synthesis on the
 * native `<button>` node/pill, so activation fires exactly once regardless
 * of input method.
 *
 * The road progress fill (`#road-progress` element, mirroring mockup ids)
 * and three ambient `.road__deco` circles are wired here (T013 · design.md
 * Motion plan · DD-005 — passive scroll listener + CSS, no GSAP): scroll
 * position drives both the fill height and the deco `translate3d` factors,
 * mirroring mockup `landing.js` `updateRoadScroll()`. Under
 * `prefers-reduced-motion: reduce` the fill goes static-full and the deco
 * transforms are cleared instead of continuing to track scroll (REQ-004
 * "Road progress" scenario / REQ-010).
 */
@Component({
  selector: 'app-services-road-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './services-road-section.html',
  styleUrl: './services-road-section.css',
})
export class ServicesRoadSection implements AfterViewInit, OnDestroy {
  protected readonly groups = GROUPS;
  /** Template-only index list to render one deco span per `ROAD_DECO_FACTORS` entry. */
  protected readonly decoIndexes = ROAD_DECO_FACTORS.map((_, index) => index);

  @ViewChild('roadEl') private readonly roadEl?: ElementRef<HTMLElement>;
  @ViewChild('roadProgress') private readonly roadProgressEl?: ElementRef<HTMLElement>;
  @ViewChildren('decoEl') private readonly decoEls?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('roadItem') private readonly roadItems?: QueryList<ElementRef<HTMLElement>>;

  private readonly motion = inject(MotionService);
  private cleanupScroll?: () => void;
  private revealObserver?: IntersectionObserver;

  private readonly openIdSignal = signal<ServiceGroupId | null>(null);
  protected readonly openId = this.openIdSignal.asReadonly();

  ngAfterViewInit(): void {
    this.cleanupScroll = onPassiveScroll(() => this.updateRoadScroll());
    this.setupRevealObserver();
  }

  ngOnDestroy(): void {
    this.cleanupScroll?.();
    this.revealObserver?.disconnect();
  }

  /**
   * Mockup `landing.js` IntersectionObserver parity: road items start faded /
   * offset and receive `.is-in` (plus `.is-active`) when they enter the
   * viewport. Under reduced motion, mark all visible immediately (REQ-010).
   */
  private setupRevealObserver(): void {
    const items = this.roadItems?.toArray().map((ref) => ref.nativeElement) ?? [];
    if (items.length === 0) {
      return;
    }

    if (this.motion.reducedMotion()) {
      for (const el of items) {
        el.classList.add('is-in', 'is-active');
      }
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      for (const el of items) {
        el.classList.add('is-in', 'is-active');
      }
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('is-in', 'is-active');
          this.revealObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
    );

    for (const el of items) {
      this.revealObserver.observe(el);
    }
  }

  protected detailId(id: ServiceGroupId): string {
    return `svc-detail-${id}`;
  }

  protected isOpen(id: ServiceGroupId): boolean {
    return this.openIdSignal() === id;
  }

  protected toggle(id: ServiceGroupId): void {
    this.openIdSignal.update((current) => (current === id ? null : id));
  }

  /**
   * Shared pointer activation for node/pill/card. Ignores clicks that
   * originate from the nested "Más info" link — it navigates on its own and
   * must not also toggle the accordion shut underneath it.
   */
  protected onActivateClick(event: MouseEvent, id: ServiceGroupId): void {
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    this.toggle(id);
  }

  /**
   * Shared keyboard activation (REQ-012: Enter/Space, not hover-only) for
   * node/pill/card. `preventDefault()` cancels the native `<button>`
   * Enter/Space-to-click synthesis so `onActivateClick` does not also fire
   * for the same keypress.
   */
  protected onActivateKeydown(event: KeyboardEvent, id: ServiceGroupId): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    event.preventDefault();
    this.toggle(id);
  }

  /** Mirrors mockup `landing.js` `updateRoadScroll()` — mockup-proven math (DD-005), no GSAP. */
  private updateRoadScroll(): void {
    const road = this.roadEl?.nativeElement;
    const progress = this.roadProgressEl?.nativeElement;
    if (!road || !progress) {
      return;
    }

    if (this.motion.reducedMotion()) {
      progress.style.height = '100%';
      this.decoEls?.forEach((deco) => {
        deco.nativeElement.style.transform = '';
      });
      return;
    }

    const rect = road.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const total = rect.height + view * 0.35;
    const traveled = Math.min(Math.max(view * 0.35 - rect.top, 0), total);
    const percent = total > 0 ? Math.min(100, Math.max(0, (traveled / total) * 100)) : 0;
    progress.style.height = `${percent}%`;

    this.decoEls?.forEach((deco, index) => {
      const factor = ROAD_DECO_FACTORS[index] ?? 0.1;
      deco.nativeElement.style.transform = `translate3d(0, ${rect.top * -factor}px, 0)`;
    });
  }
}
