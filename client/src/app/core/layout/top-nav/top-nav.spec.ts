import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';

import es from '../../../../assets/i18n/es.json';
import en from '../../../../assets/i18n/en.json';
import { LocaleService } from '../../i18n/locale.service';
import { DrawerStateService } from '../drawer-state.service';
import { TopNav } from './top-nav';

function setup(localeValue: 'es' | 'en' = 'es') {
  const locale = signal(localeValue);
  const copy = {
    es: {
      navHome: 'Inicio',
      navAboutPage: 'Nosotros',
      navServicesPage: 'Servicios',
      navCta: 'Contacto',
      navSiteAria: 'Sitio',
      langAria: 'Idioma',
      menuAria: 'Menú',
    },
    en: {
      navHome: 'Home',
      navAboutPage: 'About',
      navServicesPage: 'Services',
      navCta: 'Contact',
      navSiteAria: 'Site',
      langAria: 'Language',
      menuAria: 'Menu',
    },
  } as const;
  const fakeLocaleService = {
    locale,
    setLocale: vi.fn(async (next: 'es' | 'en') => locale.set(next)),
    translate: (key: string) => copy[locale()][key as keyof (typeof copy)['es']] ?? key,
  };

  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: fakeLocaleService }],
  });

  const fixture = TestBed.createComponent(TopNav);
  fixture.detectChanges();
  return { fixture, fakeLocaleService };
}

describe('TopNav', () => {
  it('renders the three site page links', () => {
    const { fixture } = setup();
    const links = fixture.nativeElement.querySelectorAll('.topnav__links a');
    expect(links.length).toBe(3);
  });

  it('renders the Contacto CTA', () => {
    const { fixture } = setup();
    const cta = fixture.nativeElement.querySelector('.btn--gold');
    expect(cta?.textContent).toContain('Contacto');
  });

  it('clicking ES/EN calls LocaleService.setLocale with the target locale', () => {
    const { fixture, fakeLocaleService } = setup('es');
    const [esBtn, enBtn] = fixture.nativeElement.querySelectorAll('.lang button');

    (enBtn as HTMLButtonElement).click();
    expect(fakeLocaleService.setLocale).toHaveBeenCalledWith('en');

    (esBtn as HTMLButtonElement).click();
    expect(fakeLocaleService.setLocale).toHaveBeenCalledWith('es');
  });

  it('reflects the active locale via aria-pressed', () => {
    const { fixture } = setup('en');
    const [esBtn, enBtn] = fixture.nativeElement.querySelectorAll('.lang button');
    expect(esBtn.getAttribute('aria-pressed')).toBe('false');
    expect(enBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('switching locale does NOT trigger router navigation (preserves route + hash)', () => {
    const { fixture } = setup('es');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');

    const enBtn = fixture.nativeElement.querySelectorAll('.lang button')[1] as HTMLButtonElement;
    enBtn.click();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('updates all tested top-nav chrome to EN together without mixed-locale labels (REQ-009)', async () => {
    const { fixture } = setup('es');
    const enBtn = fixture.nativeElement.querySelectorAll('.lang button')[1] as HTMLButtonElement;

    enBtn.click();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const labels = Array.from(root.querySelectorAll('.topnav__links a')).map((link) => link.textContent?.trim());
    expect(labels).toEqual(['Home', 'About', 'Services']);
    expect(root.querySelector('.btn--gold')?.textContent?.trim()).toBe('Contact');
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Site');
    expect(root.querySelector('.lang')?.getAttribute('aria-label')).toBe('Language');
    expect(root.querySelector('.menu-btn')?.getAttribute('aria-label')).toBe('Menu');
    expect(root.textContent).not.toContain('Nosotros');
    expect(root.textContent).not.toContain('Contacto');
  });

  it('menu button exposes an accessible name from menuAria and aria-controls="drawer"', () => {
    const { fixture } = setup();
    const menuBtn = fixture.nativeElement.querySelector('.menu-btn');
    expect(menuBtn.getAttribute('aria-label')).toBe('Menú');
    expect(menuBtn.getAttribute('aria-controls')).toBe('drawer');
  });

  it('clicking the menu button opens the shared DrawerStateService and toggles aria-expanded', () => {
    const { fixture } = setup();
    const drawerState = TestBed.inject(DrawerStateService);
    const menuBtn = fixture.nativeElement.querySelector('.menu-btn') as HTMLButtonElement;

    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');

    menuBtn.click();
    fixture.detectChanges();

    expect(drawerState.isOpen()).toBe(true);
    expect(menuBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('stays isOnLight() === false on deep pages (e.g. /about-us) even if .section--light elements exist in DOM', () => {
    const { fixture } = setup();
    const mockAboutSection = document.createElement('section');
    mockAboutSection.id = 'about-story';
    mockAboutSection.className = 'section--light';
    vi.spyOn(mockAboutSection, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 500,
      height: 500,
      width: 1000,
      left: 0,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(mockAboutSection);

    try {
      fixture.componentInstance.updateScrollSpy();
      fixture.detectChanges();
      expect(fixture.componentInstance.isOnLight()).toBe(false);
      expect(fixture.nativeElement.querySelector('.topnav')?.classList.contains('on-light')).toBe(false);
    } finally {
      mockAboutSection.remove();
    }
  });

  it('activates isOnLight() === true when a Home section in SECTION_ANCHOR_IDS with .section--light is active', () => {
    const { fixture } = setup();
    const mockCifrasSection = document.createElement('section');
    mockCifrasSection.id = 'cifras';
    mockCifrasSection.className = 'section--light';
    vi.spyOn(mockCifrasSection, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 500,
      height: 500,
      width: 1000,
      left: 0,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(mockCifrasSection);

    try {
      fixture.componentInstance.updateScrollSpy();
      fixture.detectChanges();
      expect(fixture.componentInstance.isOnLight()).toBe(true);
      expect(fixture.nativeElement.querySelector('.topnav')?.classList.contains('on-light')).toBe(true);
    } finally {
      mockCifrasSection.remove();
    }
  });

  describe('T018 navigation labels and mockup parity', () => {
    it('has exact mockup values for the five keys in es.json and en.json', () => {
      expect((es as Record<string, string>)['navHome']).toBe('Inicio');
      expect((es as Record<string, string>)['navAboutPage']).toBe('Nosotros');
      expect((es as Record<string, string>)['navServicesPage']).toBe('Servicios');
      expect((es as Record<string, string>)['navCta']).toBe('Contacto');
      expect((es as Record<string, string>)['navSectionInicio']).toBe('Arriba');

      expect((en as Record<string, string>)['navHome']).toBe('Home');
      expect((en as Record<string, string>)['navAboutPage']).toBe('About');
      expect((en as Record<string, string>)['navServicesPage']).toBe('Services');
      expect((en as Record<string, string>)['navCta']).toBe('Contact');
      expect((en as Record<string, string>)['navSectionInicio']).toBe('Top');
    });
  });
});



