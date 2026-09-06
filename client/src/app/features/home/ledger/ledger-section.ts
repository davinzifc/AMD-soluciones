import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';
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
 * Ledger section on Home (T005 · REQ-002 · REQ-003 · DD-035 · design.md §5.1).
 * Replaces `ServicesRoadSection` with an editorial index layout of the five service lines.
 *
 * State & Accordion:
 * - Exclusive accordion controlled by `signal<ServiceGroupId | null>` (DD-035).
 * - Defaults to 'contabilidad' open on initial load (mockup parity & REQ-002 scenario).
 * - Reactivating the open row closes it (state null / "ninguna abierta" permitted).
 * - Activating "Más info" does not toggle the accordion (protected by `closest('a')`).
 * - Collapsed detail region is marked `inert` to prevent keyboard focus trap (REQ-002 · DD-036).
 */
@Component({
  selector: 'app-ledger-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './ledger-section.html',
  styleUrl: './ledger-section.css',
})
export class LedgerSection {
  private readonly locale = inject(LocaleService);

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
}
