/**
 * Servicios group anchor ids (design §3 `ServiceGroupId`). Home's road
 * "Más info" links (T007) deep-link here as `/services#<id>` — a fragment,
 * never a child route. Order matches REQ-004 (Contabilidad, Gestión
 * Administrativa, Sistemas de Riesgo, Asesoría, Marca).
 */
export const SERVICE_GROUP_IDS = ['contabilidad', 'administrativa', 'riesgo', 'asesoria', 'marca'] as const;

export type ServiceGroupId = (typeof SERVICE_GROUP_IDS)[number];

export interface ServiceSub {
  readonly titleKey: string;
  readonly descKey: string;
}

export interface ServiceGroup {
  readonly id: ServiceGroupId;
  readonly titleKey: string;
  readonly leadKey: string;
  readonly subs: readonly ServiceSub[];
  /** Riesgo/Marca carry a placeholder note (REQ-005: MAY use validated placeholders). */
  readonly noteKey?: string;
}

/**
 * Initial visible sub-services limit before progressive disclosure (DD-019 / HITL).
 */
export const SERVICE_VISIBLE_LIMIT = 6;

/**
 * Catalog of service groups with explicit sub-service arrays (DD-020).
 * Reordered for Contabilidad per approved commercial hierarchy (DD-027).
 */
export const SERVICE_GROUPS: readonly ServiceGroup[] = [
  {
    id: 'contabilidad',
    titleKey: 'g1Title',
    leadKey: 'g1Lead',
    subs: [
      { titleKey: 'subC01t', descKey: 'subC01d' },
      { titleKey: 'subC06t', descKey: 'subC06d' },
      { titleKey: 'subC08t', descKey: 'subC08d' },
      { titleKey: 'subC09t', descKey: 'subC09d' },
      { titleKey: 'subC07t', descKey: 'subC07d' },
      { titleKey: 'subC05t', descKey: 'subC05d' },
      { titleKey: 'subC02t', descKey: 'subC02d' },
      { titleKey: 'subC03t', descKey: 'subC03d' },
      { titleKey: 'subC04t', descKey: 'subC04d' },
      { titleKey: 'subC10t', descKey: 'subC10d' },
      { titleKey: 'subC11t', descKey: 'subC11d' },
      { titleKey: 'subC12t', descKey: 'subC12d' },
      { titleKey: 'subC13t', descKey: 'subC13d' },
      { titleKey: 'subC14t', descKey: 'subC14d' },
      { titleKey: 'subC15t', descKey: 'subC15d' },
      { titleKey: 'subC16t', descKey: 'subC16d' },
    ],
  },
  {
    id: 'administrativa',
    titleKey: 'g2Title',
    leadKey: 'g2Lead',
    subs: [
      { titleKey: 'subA01t', descKey: 'subA01d' },
      { titleKey: 'subA02t', descKey: 'subA02d' },
      { titleKey: 'subA03t', descKey: 'subA03d' },
      { titleKey: 'subA04t', descKey: 'subA04d' },
    ],
  },
  {
    id: 'riesgo',
    titleKey: 'g3Title',
    leadKey: 'g3Lead',
    subs: [
      { titleKey: 'subR01t', descKey: 'subR01d' },
      { titleKey: 'subR02t', descKey: 'subR02d' },
      { titleKey: 'subR03t', descKey: 'subR03d' },
      { titleKey: 'subR04t', descKey: 'subR04d' },
    ],
    noteKey: 'g3Note',
  },
  {
    id: 'asesoria',
    titleKey: 'g4Title',
    leadKey: 'g4Lead',
    subs: [
      { titleKey: 'subAs01t', descKey: 'subAs01d' },
      { titleKey: 'subAs02t', descKey: 'subAs02d' },
      { titleKey: 'subAs03t', descKey: 'subAs03d' },
      { titleKey: 'subAs04t', descKey: 'subAs04d' },
    ],
  },
  {
    id: 'marca',
    titleKey: 'g5Title',
    leadKey: 'g5Lead',
    subs: [
      { titleKey: 'subM01t', descKey: 'subM01d' },
      { titleKey: 'subM02t', descKey: 'subM02d' },
      { titleKey: 'subM03t', descKey: 'subM03d' },
    ],
    noteKey: 'g5Note',
  },
];
