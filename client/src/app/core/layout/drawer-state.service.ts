import { Injectable, signal } from '@angular/core';

/**
 * Shared open/close state for the mobile nav drawer (REQ-002/REQ-013).
 * Decouples the hamburger trigger (`TopNav`) from the drawer surface
 * (`MobileDrawer`) and owns the "restore focus to trigger on close" contract
 * so neither component has to reach into the other's DOM.
 */
@Injectable({ providedIn: 'root' })
export class DrawerStateService {
  private readonly openSignal = signal(false);
  private triggerElement: HTMLElement | null = null;

  readonly isOpen = this.openSignal.asReadonly();

  /** Opens the drawer, remembering `trigger` (defaults to the active element) to restore focus to on close. */
  open(trigger?: HTMLElement | null): void {
    this.triggerElement = trigger ?? (document.activeElement as HTMLElement | null);
    this.openSignal.set(true);
  }

  /** Closes the drawer and restores focus to whichever control opened it. */
  close(): void {
    if (!this.openSignal()) {
      return;
    }
    this.openSignal.set(false);
    this.triggerElement?.focus();
    this.triggerElement = null;
  }

  toggle(trigger?: HTMLElement | null): void {
    if (this.openSignal()) {
      this.close();
    } else {
      this.open(trigger);
    }
  }
}
