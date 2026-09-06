import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LocaleService } from '../../../core/i18n/locale.service';
import { MotionService } from '../../../core/motion/motion.service';
import { TrustSection } from './trust-section';

const SENTINELS: Record<string, string> = {
  testimonialDotLabel: '«TESTIMONIAL_{n}»',
};

function setup(reduce: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: LocaleService,
        useValue: {
          translate: (key: string) => SENTINELS[key] ?? key,
        },
      },
      { provide: MotionService, useValue: { reducedMotion: () => reduce } },
    ],
  });
  const fixture = TestBed.createComponent(TrustSection);
  fixture.detectChanges();
  return fixture;
}

describe('TrustSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the #confianza fragment scroll target', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('#confianza')).toBeTruthy();
  });

  it('renders four metrics with i18n labels (REQ-007)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const metrics = root.querySelectorAll('.metric');
    expect(metrics.length).toBe(4);
    expect(root.textContent).toContain('m1');
    expect(root.textContent).toContain('m4');
  });

  it('places the logo fade mask only on .logos__viewport, never on the section title (REQ-007 fade scope constraint)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    const viewport = root.querySelector('.logos__viewport');
    expect(viewport).toBeTruthy();

    const title = root.querySelector('.section-head h2') as HTMLElement;
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('trustTitle');
    // The title lives in `.section-head`, a sibling of `.logos` — never a
    // descendant of the masked `.logos__viewport` — so the mask cannot dim it.
    expect(viewport?.contains(title)).toBe(false);
    expect(title.closest('.logos__viewport')).toBeNull();
  });

  it('marquee track duplicates the sector list for a seamless 50%-loop (mockup parity)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const pills = root.querySelectorAll('.logo-track .logo-pill');
    // 8 unique sectors doubled, mirroring mockup `index.html` `.logo-track`.
    expect(pills.length).toBe(16);
  });

  it('does NOT mark the logo viewport reduced when motion is allowed', () => {
    const fixture = setup(false);
    const viewport = fixture.nativeElement.querySelector('.logos__viewport') as HTMLElement;
    expect(viewport.classList.contains('is-reduced-motion')).toBe(false);
  });

  it('marks the logo viewport reduced under prefers-reduced-motion (REQ-007/010: no fluid marquee)', () => {
    const fixture = setup(true);
    const viewport = fixture.nativeElement.querySelector('.logos__viewport') as HTMLElement;
    expect(viewport.classList.contains('is-reduced-motion')).toBe(true);
  });

  it('testimonials use crossfade classes, not a horizontal marquee (DD-008: different motion model)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const quotes = root.querySelectorAll('.quote');
    expect(quotes.length).toBe(4);
    expect(quotes[0].classList.contains('is-active')).toBe(true);
    expect(quotes[1].classList.contains('is-active')).toBe(false);
    // Anti-pattern guard: testimonials must not reuse the logo marquee track class.
    expect(root.querySelector('.testimonials .logo-track')).toBeNull();
  });

  it('exposes one dot per testimonial with translated accessible name and programmatic active state (REQ-006 / REQ-011)', () => {
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;
    const dots = root.querySelectorAll<HTMLButtonElement>('.testimonial-dots button');
    expect(dots.length).toBe(4);
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots[1].getAttribute('aria-current')).toBe('false');
    expect(dots[0].getAttribute('aria-label')).toBe('«TESTIMONIAL_1»');
    expect(dots[1].getAttribute('aria-label')).toBe('«TESTIMONIAL_2»');
    expect(dots[2].getAttribute('aria-label')).toBe('«TESTIMONIAL_3»');
    expect(dots[3].getAttribute('aria-label')).toBe('«TESTIMONIAL_4»');
    // Anti-pattern guard: no hardcoded Spanish literal (REQ-011)
    expect(dots[0].getAttribute('aria-label')).not.toBe('Testimonio 1');
  });

  it('does NOT auto-advance testimonials over time (REQ-006: 15s fake timers regression test)', () => {
    vi.useFakeTimers();
    const fixture = setup(false);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.quote')[0].classList.contains('is-active')).toBe(true);
    expect(root.querySelectorAll('.quote')[1].classList.contains('is-active')).toBe(false);

    vi.advanceTimersByTime(15_000);
    fixture.detectChanges();

    expect(root.querySelectorAll('.quote')[0].classList.contains('is-active')).toBe(true);
    expect(root.querySelectorAll('.quote')[1].classList.contains('is-active')).toBe(false);
  });

  it('clicking a dot selects that testimonial manually even under reduced motion (content stays reachable)', () => {
    const fixture = setup(true);
    const root = fixture.nativeElement as HTMLElement;

    const dots = root.querySelectorAll<HTMLButtonElement>('.testimonial-dots button');
    dots[2].click();
    fixture.detectChanges();

    const quotes = root.querySelectorAll('.quote');
    expect(quotes[2].classList.contains('is-active')).toBe(true);
    expect(quotes[0].classList.contains('is-active')).toBe(false);
    expect(dots[2].getAttribute('aria-current')).toBe('true');
  });

  it('contains ClientWall within the #confianza section (KZ-004 ancestry)', () => {
    const fixture = setup(false);
    const section = fixture.nativeElement.querySelector('#confianza') as HTMLElement;
    expect(section).toBeTruthy();
    const clientWall = section.querySelector('app-client-wall');
    expect(clientWall).toBeTruthy();
    expect(section.contains(clientWall)).toBe(true);
  });

  it('Contactar CTA routes to the Home #contacto fragment', () => {
    const fixture = setup(false);
    const cta = fixture.nativeElement.querySelector('a.btn--ink') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/#contacto');
    expect(cta.textContent).toContain('trustCta');
  });
});
