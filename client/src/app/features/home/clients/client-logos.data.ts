export interface ClientLogo {
  readonly slug: string;
  readonly name: string;
  readonly w: number;
  readonly h: number;
}

export const CLIENT_LOGOS: readonly ClientLogo[] = [
  { slug: 'ballet-capital', name: 'Fundación Ballet Capital', w: 91, h: 78 },
  { slug: 'caval-compliance', name: 'Caval Compliance Corporation', w: 61, h: 69 },
  { slug: 'digicort', name: 'Digicort', w: 114, h: 53 },
  { slug: 'dyp-capital', name: 'D&P Capital Inversiones', w: 115, h: 68 },
  { slug: 'gesap-erp', name: 'Gesap ERP', w: 144, h: 54 },
  { slug: 'glowing-digital-cloud', name: 'Glowing Digital Cloud', w: 85, h: 66 },
  { slug: 'kaes', name: 'KAES', w: 123, h: 53 },
  { slug: 'loto-group', name: 'Loto Group', w: 139, h: 44 },
  { slug: 'nfes-solutions', name: 'NFES Solutions', w: 60, h: 74 },
  { slug: 'obed-services', name: 'Obed Services', w: 98, h: 78 },
  { slug: 'siddhi-autotech', name: 'Siddhi Autotech', w: 88, h: 68 },
  { slug: 'sk-glam', name: 'SK Glam', w: 100, h: 57 },
  { slug: 'virtual-cloud-world', name: 'Virtual Cloud World', w: 193, h: 46 },
] as const;
