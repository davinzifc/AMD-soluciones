import { Component, ElementRef, ViewChild, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { LocalizePipe } from '../../i18n/localize.pipe';
import { DrawerStateService } from '../drawer-state.service';

/**
 * Mobile nav drawer (REQ-002 mobile chrome / REQ-013 focus trap).
 * Page links always show; Home section anchors (`#servicios`, `#sobre-amd`,
 * `#confianza`, `#contacto`) only render while the current route is `/`.
 * Focus is trapped inside while open (Tab wraps, Escape closes) and restored
 * to the hamburger trigger via `DrawerStateService.close()`.
 */
@Component({
  selector: 'app-mobile-drawer',
  imports: [RouterLink, RouterLinkActive, LocalizePipe],
  templateUrl: './mobile-drawer.html',
  styleUrl: './mobile-drawer.css',
})
export class MobileDrawer {
  @ViewChild('drawerEl') private readonly drawerEl?: ElementRef<HTMLDivElement>;

  private readonly drawerState = inject(DrawerStateService);
  private readonly router = inject(Router);

  readonly isOpen = this.drawerState.isOpen;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** True only on Home (`/`) — drives whether section anchors render alongside page links. */
  readonly isHomeRoute = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '/' || path === '';
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.focusFirstElement();
      }
    });
  }

  protected close(): void {
    this.drawerState.close();
  }

  /** Traps Tab within the drawer and closes on Escape (REQ-013). */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.focusableElements();
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirstElement(): void {
    const [first] = this.focusableElements();
    (first ?? this.drawerEl?.nativeElement)?.focus();
  }

  private focusableElements(): HTMLElement[] {
    const root = this.drawerEl?.nativeElement;
    if (!root) {
      return [];
    }
    return Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
  }
}
