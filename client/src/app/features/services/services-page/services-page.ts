import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocalizePipe } from '../../../core/i18n/localize.pipe';

/**
 * Servicios group anchor ids (design §3 `ServiceGroupId`). Home's road
 * "Más info" links (T007) deep-link here as `/servicios#<id>` — a fragment,
 * never a child route. Order matches REQ-004 (Contabilidad, Gestión
 * Administrativa, Sistemas de Riesgo, Asesoría, Marca).
 */
export const SERVICE_GROUP_IDS = ['contabilidad', 'administrativa', 'riesgo', 'asesoria', 'marca'] as const;

interface ServiceGroupStub {
  readonly id: (typeof SERVICE_GROUP_IDS)[number];
  readonly titleKey: string;
  readonly summaryKey: string;
}

const GROUPS: readonly ServiceGroupStub[] = [
  { id: 'contabilidad', titleKey: 'g1Title', summaryKey: 'g1Sum' },
  { id: 'administrativa', titleKey: 'g2Title', summaryKey: 'g2Sum' },
  { id: 'riesgo', titleKey: 'g3Title', summaryKey: 'g3Sum' },
  { id: 'asesoria', titleKey: 'g4Title', summaryKey: 'g4Sum' },
  { id: 'marca', titleKey: 'g5Title', summaryKey: 'g5Sum' },
];

/**
 * Servicios route (`/servicios`) stub (T005). Full sub-service catalog and
 * TOC land in T012; this stub guarantees the five `ServiceGroupId` anchors
 * exist as scroll targets for the fragment contract (`withInMemoryScrolling`)
 * and for Home's future road deep-links.
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
