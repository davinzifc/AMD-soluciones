import { TestBed } from '@angular/core/testing';

import { ConsoleAnalyticsService } from './console-analytics.service';

describe('ConsoleAnalyticsService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the event name and payload via console.info (NFR-004 stub, no vendor SDK required)', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const service = TestBed.inject(ConsoleAnalyticsService);

    service.track('contact_submit', { hasService: true });

    expect(spy).toHaveBeenCalledWith('[analytics] contact_submit', { hasService: true });
  });

  it('defaults the payload to an empty object when omitted', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const service = TestBed.inject(ConsoleAnalyticsService);

    service.track('whatsapp_click');

    expect(spy).toHaveBeenCalledWith('[analytics] whatsapp_click', {});
  });
});
