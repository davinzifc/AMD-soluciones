import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { HomePage } from './home-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();
  return fixture;
}

describe('HomePage', () => {
  it('exposes the five Home dual-nav anchor targets as element ids (fragment scroll contract)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['inicio', 'servicios', 'sobre-amd', 'confianza', 'contacto']) {
      expect(root.querySelector(`#${id}`)).toBeTruthy();
    }
  });
});
