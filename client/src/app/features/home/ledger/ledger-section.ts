import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { onPassiveScroll } from '../../../core/motion/scroll-listener';
import {
  SERVICE_GROUPS,
  type ServiceGroup,
  type ServiceGroupId,
} from '../../services/services-page/services-page';

export interface LedgerLine {
  readonly id: ServiceGroupId;
  readonly ordinal: string;
  readonly titleKey: string;
  readonly summaryKey: string;
  readonly bodyKey: string;
  readonly count: number;
  readonly image: string;
}

/**
 * Builds the five ledger lines derived strictly from `SERVICE_GROUPS` (REQ-002 · DD-035).
 * The service count is dynamically computed from `group.subs.length` — never a hardcoded literal.
 * `summaryKey` and `bodyKey` derive from `group.titleKey` to guarantee semantic pairing regardless of array ordering.
 */
export function buildLedgerLines(groups: readonly ServiceGroup[]): readonly LedgerLine[] {
  return groups.map((group, index) => {
    const ordinal = String(index + 1).padStart(2, '0');
    return {
      id: group.id,
      ordinal,
      titleKey: group.titleKey,
      summaryKey: group.titleKey.replace('Title', 'Sum'),
      bodyKey: group.titleKey.replace('Title', 'Body'),
      count: group.subs.length,
      image: `media/line-${ordinal}-${group.id}.webp`,
    };
  });
}

/**
 * Ledger section on Home (T005/T006 · REQ-002 · REQ-003 · REQ-009 · REQ-010 · REQ-012 · DD-035 · design.md §5.1).
 * Replaces `ServicesRoadSection` with an editorial index layout of the five service lines.
 *
 * State & Accordion:
 * - Exclusive accordion controlled by `signal<ServiceGroupId | null>` (DD-035).
 * - Defaults to 'contabilidad' open on initial load (mockup parity & REQ-002 scenario).
 * - Reactivating the open row closes it (state null / "ninguna abierta" permitted).
 * - Activating "Más info" does not toggle the accordion (protected by `closest('a')`).
 * - Collapsed detail region is marked `inert` to prevent keyboard focus trap (REQ-002 · DD-036).
 *
 * Motion & Parallax:
 * - Dynamic spine tracking via `onPassiveScroll()` (mockup `home-redesign.js` parity).
 * - Static spine at 100% under `prefers-reduced-motion: reduce` (REQ-002/REQ-010).
 * - Reveal animations via `IntersectionObserver` with `.is-in` class (fallback when IO undefined).
 */
@Component({
  selector: 'app-ledger-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './ledger-section.html',
  styleUrl: './ledger-section.css',
})
export class LedgerSection implements AfterViewInit, OnDestroy {
  @ViewChild('headEl') private readonly headEl?: ElementRef<HTMLElement>;
  @ViewChild('bodyEl') private readonly bodyEl?: ElementRef<HTMLElement>;
  @ViewChild('spineEl') private readonly spineEl?: ElementRef<HTMLElement>;
  @ViewChildren('lineEl') private readonly lineEls?: QueryList<ElementRef<HTMLElement>>;

  private readonly locale = inject(LocaleService);
  private readonly motion = inject(MotionService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private cleanupScroll?: () => void;
  private revealObserver?: IntersectionObserver;

  protected readonly lines: readonly LedgerLine[] = buildLedgerLines(SERVICE_GROUPS);
  protected readonly totalServices = SERVICE_GROUPS.reduce((acc, g) => acc + g.subs.length, 0);

  /** Dynamic CTA label interpolating the derived total service count (matches `svcShowMore` pattern). */
  readonly allCtaLabel = computed(() => {
    const template = this.locale.translate('ledgerAllCta');
    return template.replace('{n}', String(this.totalServices));
  });

  private readonly openIdSignal = signal<ServiceGroupId | null>('contabilidad');
  private readonly hotIdSignal = signal<ServiceGroupId | null>(null);

  protected buttonId(id: ServiceGroupId): string {
    return `btn-${id}`;
  }

  protected detailId(id: ServiceGroupId): string {
    return `d-${id}`;
  }

  isOpen(id: ServiceGroupId): boolean {
    return this.openIdSignal() === id;
  }

  protected isHot(id: ServiceGroupId): boolean {
    return this.hotIdSignal() === id || this.isOpen(id);
  }

  toggle(id: ServiceGroupId): void {
    this.openIdSignal.update((current) => (current === id ? null : id));
  }

  protected onFocus(id: ServiceGroupId): void {
    this.hotIdSignal.set(id);
  }

  protected onBlur(id: ServiceGroupId): void {
    if (this.hotIdSignal() === id) {
      this.hotIdSignal.set(null);
    }
  }

  protected onPointerEnter(id: ServiceGroupId): void {
    this.hotIdSignal.set(id);
  }

  protected onPointerLeave(id: ServiceGroupId): void {
    if (this.hotIdSignal() === id) {
      this.hotIdSignal.set(null);
    }
  }

  /**
   * Pointer activation handler. Ignores clicks originating from nested anchor tags
   * (e.g. "Más info") so deep-links navigate without toggling the accordion (REQ-003).
   */
  onActivateClick(event: MouseEvent, id: ServiceGroupId): void {
    if ((event.target as HTMLElement | null)?.closest?.('a')) {
      return;
    }
    this.toggle(id);
  }

  /**
   * Keyboard activation handler (REQ-002: Enter and Space).
   * Prevents browser click synthesis on `<button>` elements so `toggle()` fires exactly once.
   */
  onActivateKeydown(event: KeyboardEvent, id: ServiceGroupId): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if ((event.target as HTMLElement | null)?.closest?.('a')) {
      return;
    }
    event.preventDefault();
    this.toggle(id);
  }

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      const spine =
        this.spineEl?.nativeElement ??
        this.elementRef.nativeElement.querySelector<HTMLElement>('[data-spine]');
      if (spine) {
        spine.style.height = '100%';
      }
    } else {
      this.cleanupScroll = onPassiveScroll(() => this.updateSpine());
      this.updateSpine();
    }
    this.setupRevealObserver();
  }

  ngOnDestroy(): void {
    this.cleanupScroll?.();
    this.revealObserver?.disconnect();
  }

  /**
   * Mockup `home-redesign.js` spine progress: tracks scroll position within `.ledger__body`.
   * Under `prefers-reduced-motion: reduce`, the spine stays static at 100% (REQ-002 / REQ-010).
   */
  private updateSpine(): void {
    const body =
      this.bodyEl?.nativeElement ??
      this.elementRef.nativeElement.querySelector<HTMLElement>('.ledger__body');
    const spine =
      this.spineEl?.nativeElement ??
      this.elementRef.nativeElement.querySelector<HTMLElement>('[data-spine]');
    if (!body || !spine) {
      return;
    }

    if (this.motion.reducedMotion()) {
      spine.style.height = '100%';
      return;
    }

    const r = body.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const progress = r.height > 0 ? (vh * 0.72 - r.top) / r.height : 0;
    spine.style.height = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }

  /**
   * Mockup reveal with IntersectionObserver parity (services-road-section.ts pattern):
   * 1. If reducedMotion() -> marks all visible immediately without observer.
   * 2. If IntersectionObserver is undefined -> marks all visible immediately.
   * 3. Otherwise observes with threshold 0.18 and rootMargin '0px 0px -10% 0px', unobserving on intersection.
   */
  private setupRevealObserver(): void {
    const head =
      this.headEl?.nativeElement ??
      this.elementRef.nativeElement.querySelector<HTMLElement>('.ledger__head');
    const lines = this.lineEls?.length
      ? this.lineEls.toArray().map((ref) => ref.nativeElement)
      : Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.line'));
    const items = head ? [head, ...lines] : lines;
    if (items.length === 0) {
      return;
    }

    if (this.motion.reducedMotion()) {
      for (const el of items) {
        el.classList.add('is-in');
      }
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      for (const el of items) {
        el.classList.add('is-in');
      }
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('is-in');
          this.revealObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
    );

    for (const el of items) {
      this.revealObserver.observe(el);
    }
  }
}
