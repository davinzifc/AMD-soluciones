import { TestBed } from '@angular/core/testing';

import { DrawerStateService } from './drawer-state.service';

describe('DrawerStateService', () => {
  it('starts closed', () => {
    const service = TestBed.inject(DrawerStateService);
    expect(service.isOpen()).toBe(false);
  });

  it('open() sets isOpen to true', () => {
    const service = TestBed.inject(DrawerStateService);
    service.open();
    expect(service.isOpen()).toBe(true);
  });

  it('close() restores focus to the trigger element passed to open()', () => {
    const service = TestBed.inject(DrawerStateService);
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);

    service.open(trigger);
    expect(service.isOpen()).toBe(true);

    service.close();
    expect(service.isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });

  it('open() without an explicit trigger falls back to document.activeElement', () => {
    const service = TestBed.inject(DrawerStateService);
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    service.open();
    service.close();
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });

  it('close() is a no-op when already closed (no crash, stays closed)', () => {
    const service = TestBed.inject(DrawerStateService);
    expect(() => service.close()).not.toThrow();
    expect(service.isOpen()).toBe(false);
  });

  it('toggle() flips state and closing via toggle also restores focus', () => {
    const service = TestBed.inject(DrawerStateService);
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);

    service.toggle(trigger);
    expect(service.isOpen()).toBe(true);

    service.toggle();
    expect(service.isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });
});
