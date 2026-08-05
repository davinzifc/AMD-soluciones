import { Injectable } from '@angular/core';

import type { AnalyticsEventName, AnalyticsPort } from './analytics-port';

/**
 * Console-only analytics stub (NFR-004 — "stub events invocable without a
 * vendor"). Swap this for a real vendor adapter in phase 2 by providing
 * `ANALYTICS_PORT` with a different implementation; nothing downstream
 * needs to change since callers only depend on the `AnalyticsPort` shape.
 */
@Injectable({ providedIn: 'root' })
export class ConsoleAnalyticsService implements AnalyticsPort {
  track(event: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    console.info(`[analytics] ${event}`, payload);
  }
}
