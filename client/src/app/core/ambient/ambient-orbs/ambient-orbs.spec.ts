import { TestBed } from '@angular/core/testing';

import { MotionService } from '../../motion/motion.service';
import { AmbientOrbsComponent } from './ambient-orbs';

function setup(reduce = false) {
  TestBed.configureTestingModule({
    providers: [{ provide: MotionService, useValue: { reducedMotion: () => reduce } }],
  });
  const fixture = TestBed.createComponent(AmbientOrbsComponent);
  fixture.detectChanges();
  return fixture;
}

function orbsOf(fixture: ReturnType<typeof setup>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.orb')) as HTMLElement[];
}

describe('AmbientOrbsComponent', () => {
  it('renders 8 orbs by default (HITL count)', () => {
    const fixture = setup();
    expect(orbsOf(fixture).length).toBe(8);
  });

  it('sizes every orb within the default [300, 560] range (HITL sizeMin/sizeMax)', () => {
    const fixture = setup();
    const orbs = orbsOf(fixture);
    expect(orbs.length).toBeGreaterThan(0);
    for (const orb of orbs) {
      const width = parseFloat(orb.style.width);
      const height = parseFloat(orb.style.height);
      expect(width).toBeGreaterThanOrEqual(300);
      expect(width).toBeLessThanOrEqual(560);
      expect(height).toBe(width);
    }
  });

  it('overriding count changes the number of rendered orbs (reuse contract, REQ-001)', () => {
    const fixture = setup();
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    expect(orbsOf(fixture).length).toBe(3);
  });

  it('overriding sizeMin/sizeMax changes the rendered orb size bounds', () => {
    const fixture = setup();
    fixture.componentRef.setInput('sizeMin', 40);
    fixture.componentRef.setInput('sizeMax', 60);
    fixture.detectChanges();
    for (const orb of orbsOf(fixture)) {
      const width = parseFloat(orb.style.width);
      expect(width).toBeGreaterThanOrEqual(40);
      expect(width).toBeLessThanOrEqual(60);
    }
  });

  it('clamps count to at least 1 and normalizes an inverted size range', () => {
    const fixture = setup();
    fixture.componentRef.setInput('count', 0);
    fixture.componentRef.setInput('sizeMin', 500);
    fixture.componentRef.setInput('sizeMax', 100);
    fixture.detectChanges();
    const orbs = orbsOf(fixture);
    expect(orbs.length).toBe(1);
    const width = parseFloat(orbs[0].style.width);
    expect(width).toBeGreaterThanOrEqual(100);
    expect(width).toBeLessThanOrEqual(500);
  });

  it('is hidden from assistive tech via aria-hidden on the host (REQ-003 decorative-only)', () => {
    const fixture = setup();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });

  it('never captures pointer events, on the host or on individual orbs', () => {
    const fixture = setup();
    const host = fixture.nativeElement as HTMLElement;
    expect(getComputedStyle(host).pointerEvents).toBe('none');

    const orb = orbsOf(fixture)[0];
    expect(orb).toBeTruthy();
    expect(getComputedStyle(orb).pointerEvents).toBe('none');
  });

  it('runs the orbit (not paused) when MotionService reports motion is allowed', () => {
    const fixture = setup(false);
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('is-paused')).toBe(false);

    const orb = orbsOf(fixture)[0];
    expect(orb.style.animationPlayState).toBe('running');
  });

  it('pauses the orbit when MotionService.reducedMotion() is true (REQ-003 / DD-HFO-004)', () => {
    const fixture = setup(true);
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('is-paused')).toBe(true);

    const orbs = orbsOf(fixture);
    expect(orbs.length).toBeGreaterThan(0);
    for (const orb of orbs) {
      expect(orb.style.animationPlayState).toBe('paused');
    }
  });

  it('accepts an overridden colors input without falling back to HITL defaults', () => {
    const fixture = setup();
    fixture.componentRef.setInput('colors', ['rgba(1, 2, 3, 0.5)']);
    fixture.detectChanges();
    const orb = orbsOf(fixture)[0];
    expect(orb.style.background).toContain('rgba(1, 2, 3, 0.5)');
  });

  it('honors durationSec override on each orb animationDuration (REQ-001 input contract)', () => {
    const fixture = setup();
    fixture.componentRef.setInput('durationSec', 4);
    fixture.detectChanges();
    for (const orb of orbsOf(fixture)) {
      const seconds = parseFloat(orb.style.animationDuration);
      // Formula: random(base*0.85, base*1.55) + base*0.35 → [4.8, 7.6] at base=4
      expect(seconds).toBeGreaterThanOrEqual(4.8);
      expect(seconds).toBeLessThanOrEqual(7.6);
    }
  });
});
