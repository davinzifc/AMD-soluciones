import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';
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
 * The road progress fill (`#road-progress` element, mirroring mockup ids) is
 * intentionally static here — T013 owns wiring the scroll-driven fill per the
 * design.md Motion plan; this section only guarantees the DOM hook exists.
 */
@Component({
  selector: 'app-services-road-section',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './services-road-section.html',
  styleUrl: './services-road-section.css',
})
export class ServicesRoadSection {
  protected readonly groups = GROUPS;

  private readonly openIdSignal = signal<ServiceGroupId | null>(null);
  protected readonly openId = this.openIdSignal.asReadonly();

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
}
