import { AfterViewInit, Component, DestroyRef, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../i18n/localize.pipe';

interface SideNavAnchor {
  readonly id: string;
  readonly labelKey: string;
}

/**
 * Home dual-nav section anchors, in scroll order (design.md §6 `HomeSideNav`;
 * REQ-002). Ids match the fragment contract already used by `MobileDrawer`,
 * `TopNav`'s Contactar CTA, and every section's own root `id`.
 */
const ANCHORS: readonly SideNavAnchor[] = [
  { id: 'inicio', labelKey: 'sideHome' },
  { id: 'servicios', labelKey: 'navServices' },
  { id: 'sobre-amd', labelKey: 'navAbout' },
  { id: 'confianza', labelKey: 'navTrust' },
  { id: 'contacto', labelKey: 'navContact' },
];

/**
 * Home-only floating section nav (T013 · REQ-002 · design.md §6
 * `HomeSideNav` · DD-007). Dots + labels, **no opaque bar** — CSS alone
 * gates visibility to `≥1100px` via the existing `body.has-side-nav` class
 * (T005). Scroll-spy and light/dark contrast are computed here per the
 * mockup `landing.js` `updateSideNav()` algorithm:
 *
 * - **Active anchor**: the last anchor (in DOM order) whose target
 *   section's `offsetTop` is at or above `scrollY + innerHeight * 0.35`.
 * - **`is-on-light`**: independent of which anchor is active — whichever
 *   Home section sits under *that dot's own* vertical midpoint is checked
 *   for the shared `.section--light` marker class (present on the two mist
 *   sections, `ServicesRoadSection` and `TrustSection`).
 *
 * Both reads hit the live DOM (`document.getElementById`) because the five
 * Home sections render inside `<router-outlet>` — a sibling subtree this
 * component (mounted directly in `app.html`) has no template handle to.
 * The mockup crosses the same boundary with plain `document.*` calls.
 */
@Component({
  selector: 'app-home-side-nav',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './home-side-nav.html',
  styleUrl: './home-side-nav.css',
})
export class HomeSideNav implements AfterViewInit {
  protected readonly anchors = ANCHORS;

  @ViewChildren('anchorLink') private readonly anchorLinks?: QueryList<ElementRef<HTMLAnchorElement>>;

  private readonly destroyRef = inject(DestroyRef);

  private readonly activeIdSignal = signal(ANCHORS[0].id);
  protected readonly activeId = this.activeIdSignal.asReadonly();

  private readonly onLightIdsSignal = signal<ReadonlySet<string>>(new Set());
  protected readonly onLightIds = this.onLightIdsSignal.asReadonly();

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = (): void => this.updateScrollSpy();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });

    handler();
    // Home route sections load lazily (`app.routes.ts` loadComponent); retry
    // shortly after mount in case they were not yet in the DOM on the first
    // pass. Any real scroll/resize thereafter self-corrects regardless.
    const retryId = setTimeout(handler, 0);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      clearTimeout(retryId);
    });
  }

  protected isActive(id: string): boolean {
    return this.activeIdSignal() === id;
  }

  protected isOnLight(id: string): boolean {
    return this.onLightIdsSignal().has(id);
  }

  private updateScrollSpy(): void {
    const sections = this.anchors
      .map((anchor) => document.getElementById(anchor.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) {
      return;
    }

    const y = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= y) {
        current = section;
      }
    }
    this.activeIdSignal.set(current.id);

    const onLight = new Set<string>();
    for (const linkRef of this.anchorLinks?.toArray() ?? []) {
      const link = linkRef.nativeElement;
      const id = link.dataset['anchorId'];
      if (!id) {
        continue;
      }
      const rect = link.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const under = HomeSideNav.sectionAtY(sections, midY);
      if (under?.classList.contains('section--light')) {
        onLight.add(id);
      }
    }
    this.onLightIdsSignal.set(onLight);
  }

  private static sectionAtY(sections: readonly HTMLElement[], y: number): HTMLElement | null {
    let hit: HTMLElement | null = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        hit = section;
      }
    }
    return hit;
  }
}
