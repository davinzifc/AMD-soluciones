import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';

import { LocaleService } from '../../i18n/locale.service';
import { DrawerStateService } from '../drawer-state.service';
import { TopNav } from './top-nav';

function setup(localeValue: 'es' | 'en' = 'es') {
  const fakeLocaleService = {
    locale: signal(localeValue),
    setLocale: vi.fn(async () => undefined),
    translate: (key: string) => key,
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

  it('renders the Contactar CTA', () => {
    const { fixture } = setup();
    const cta = fixture.nativeElement.querySelector('.btn--gold');
    expect(cta?.textContent).toContain('navCta');
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

  it('menu button exposes an accessible name from menuAria and aria-controls="drawer"', () => {
    const { fixture } = setup();
    const menuBtn = fixture.nativeElement.querySelector('.menu-btn');
    expect(menuBtn.getAttribute('aria-label')).toBe('menuAria');
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
});
