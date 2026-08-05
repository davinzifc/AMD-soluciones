import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { SERVICE_GROUP_IDS, ServicesPage } from './services-page';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: LocaleService, useValue: { translate: (key: string) => key } }],
  });
  const fixture = TestBed.createComponent(ServicesPage);
  fixture.detectChanges();
  return fixture;
}

describe('ServicesPage', () => {
  it('covers all five ServiceGroupId anchors as element ids (REQ-004/005 traceability)', () => {
    const fixture = setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(SERVICE_GROUP_IDS.length).toBe(5);
    for (const id of SERVICE_GROUP_IDS) {
      expect(root.querySelector(`#${id}`)).toBeTruthy();
    }
  });

  it('does not render a nested route outlet for group anchors (fragment, not child route)', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeNull();
  });
});
