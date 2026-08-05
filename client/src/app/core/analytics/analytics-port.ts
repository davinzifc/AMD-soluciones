import { InjectionToken, inject } from '@angular/core';

import { ConsoleAnalyticsService } from './console-analytics.service';

/** Stub analytics event names wired for T010 (NFR-004) — no vendor SDK in phase 1. */
export type AnalyticsEventName = 'contact_submit' | 'whatsapp_click';

export interface AnalyticsPort {
  track(event: AnalyticsEventName, payload?: Record<string, unknown>): void;
}

/**
 * DI token for the analytics port (interface + `InjectionToken` pattern —
 * matches `WHATSAPP_NUMBER`). Default factory wires the console stub;
 * tests override with `{ provide: ANALYTICS_PORT, useValue: { track: vi.fn() } }`.
 */
export const ANALYTICS_PORT = new InjectionToken<AnalyticsPort>('ANALYTICS_PORT', {
  providedIn: 'root',
  factory: () => inject(ConsoleAnalyticsService),
});
