import { TestBed } from '@angular/core/testing';

import { MotionService } from './motion.service';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const mediaQueryList = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQueryList),
  );
  return {
    dispatchChange(matches: boolean): void {
      mediaQueryList.matches = matches;
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}

describe('MotionService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the initial prefers-reduced-motion value at construction', () => {
    stubMatchMedia(true);
    const service = TestBed.inject(MotionService);
    expect(service.reducedMotion()).toBe(true);
  });

  it('defaults to false when the preference is not active', () => {
    stubMatchMedia(false);
    const service = TestBed.inject(MotionService);
    expect(service.reducedMotion()).toBe(false);
  });

  it('defaults to false when matchMedia is unavailable (older jsdom / SSR-like environment)', () => {
    vi.stubGlobal('matchMedia', undefined);
    const service = TestBed.inject(MotionService);
    expect(service.reducedMotion()).toBe(false);
  });

  it('updates reactively when the OS preference changes mid-session — no reload required', () => {
    const { dispatchChange } = stubMatchMedia(false);
    const service = TestBed.inject(MotionService);
    expect(service.reducedMotion()).toBe(false);

    dispatchChange(true);
    expect(service.reducedMotion()).toBe(true);

    dispatchChange(false);
    expect(service.reducedMotion()).toBe(false);
  });

  it('stops listening once the injector is destroyed (no leaked change listener)', () => {
    const { listenerCount } = stubMatchMedia(false);
    TestBed.inject(MotionService);
    expect(listenerCount()).toBe(1);

    TestBed.resetTestingModule();
    expect(listenerCount()).toBe(0);
  });
});
