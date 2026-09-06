import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { HomePage } from './home-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: LocaleService, useValue: { translate: (key: string) => key, locale: () => 'es' as const } },
    ],
  });
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();
  return fixture;
}

describe('HomePage', () => {
  it('exposes the six Home dual-nav anchor targets as element ids (fragment scroll contract)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['inicio', 'servicios', 'sobre-amd', 'cifras', 'confianza', 'contacto']) {
      expect(root.querySelector(`#${id}`)).toBeTruthy();
    }
  });

  it('mounts the figures band section with #cifras', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-figures-band')).toBeTruthy();
    expect(root.querySelector('section#cifras')).toBeTruthy();
  });

  it('mounts the ledger section and does not mount the services road', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-ledger-section')).toBeTruthy();
    expect(root.querySelector('app-services-road-section')).toBeNull();
  });

  it('replaces the old #contacto stub with the real Contact form (T010)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#contacto form')).toBeTruthy();
    expect(root.querySelector('#contacto .stub-note')).toBeNull();
  });
});
