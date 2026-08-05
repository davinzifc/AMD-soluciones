import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Servicios group anchor ids (design §3 `ServiceGroupId`). Home's road
 * "Más info" links (T007) deep-link here as `/services#<id>` — a fragment,
 * never a child route. Order matches REQ-004 (Contabilidad, Gestión
 * Administrativa, Sistemas de Riesgo, Asesoría, Marca).
 */
export const SERVICE_GROUP_IDS = ['contabilidad', 'administrativa', 'riesgo', 'asesoria', 'marca'] as const;

interface ServiceSub {
  readonly titleKey: string;
  readonly descKey: string;
}

interface ServiceGroup {
  readonly id: (typeof SERVICE_GROUP_IDS)[number];
  readonly titleKey: string;
  readonly leadKey: string;
  readonly subs: readonly ServiceSub[];
  /** Riesgo/Marca carry a placeholder note (REQ-005: MAY use validated placeholders). */
  readonly noteKey?: string;
}

/**
 * Builds the `subXX(t|d)` key pairs seeded from mockup `i18n.js` (already
 * mirrored into `assets/i18n/{es,en}.json` by T003) for a given sub-service
 * prefix, e.g. `subKeys('C', 16)` → `subC01t`/`subC01d` … `subC16t`/`subC16d`.
 */
function subKeys(prefix: string, count: number): ServiceSub[] {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(2, '0');
    return { titleKey: `sub${prefix}${n}t`, descKey: `sub${prefix}${n}d` };
  });
}

const GROUPS: readonly ServiceGroup[] = [
  { id: 'contabilidad', titleKey: 'g1Title', leadKey: 'g1Lead', subs: subKeys('C', 16) },
  { id: 'administrativa', titleKey: 'g2Title', leadKey: 'g2Lead', subs: subKeys('A', 4) },
  { id: 'riesgo', titleKey: 'g3Title', leadKey: 'g3Lead', subs: subKeys('R', 4), noteKey: 'g3Note' },
  { id: 'asesoria', titleKey: 'g4Title', leadKey: 'g4Lead', subs: subKeys('As', 4) },
  { id: 'marca', titleKey: 'g5Title', leadKey: 'g5Lead', subs: subKeys('M', 3), noteKey: 'g5Note' },
];

/**
 * Servicios deep page (T012 · REQ-005 · design.md §6 Deep pages). Page hero +
 * in-page TOC + the five `ServiceGroup` articles with sub-service catalogs,
 * seeded from mockup `servicios.html` / `i18n.js`. Every `article[id]` uses
 * the exact `SERVICE_GROUP_IDS` string so Home's road "Más info" fragment
 * links (`/services#<id>`, T007) always resolve to a real scroll target —
 * the two features share this same constant to prevent id drift.
 *
 * Riesgo and Marca sub-service copy is flagged with a visible placeholder
 * note (`g3Note`/`g5Note`) per REQ-005 ("MAY use validated placeholders
 * until AMD finalizes copy") — the anchors and structure are still real,
 * only the copy is provisional.
 */
@Component({
  selector: 'app-services-page',
  imports: [RouterLink, LocalizePipe],
  templateUrl: './services-page.html',
  styleUrl: './services-page.css',
})
export class ServicesPage {
  protected readonly groups = GROUPS;
}
