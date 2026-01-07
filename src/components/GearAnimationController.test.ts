import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import * as timerService from '../services/timerService';
import { initializeGearAnimations } from './GearAnimationController';

vi.useFakeTimers();

describe('GearAnimationController integration with timerService', () => {
  let cleanup: () => void = () => {};

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="gear"></div>
      <div class="gear"></div>
    `;
    timerService.initializeTimer();
    cleanup = initializeGearAnimations();
  });

  afterEach(() => {
    try { cleanup(); } catch (e) { }
    timerService.resetTimer();
    document.body.innerHTML = '';
  });

  it('adds running class on start and removes on pause', () => {
    timerService.startTimer();

    const gears = Array.from(document.querySelectorAll<HTMLElement>('.gear'));
    for (const g of gears) {
      expect(g.classList.contains('running')).toBe(true);
    }

    timerService.pauseTimer();

    const gearsAfter = Array.from(document.querySelectorAll<HTMLElement>('.gear'));
    for (const g of gearsAfter) {
      expect(g.classList.contains('running')).toBe(false);
    }
  });

  it('reset triggers resetting class briefly and forces reflow', () => {
    const el = document.querySelector<HTMLElement>('.gear')!;
    const offsetSpy = vi.fn(() => 42);
    Object.defineProperty(el, 'offsetWidth', { get: offsetSpy });

    timerService.resetTimer();

    expect(offsetSpy).toHaveBeenCalled();
    // resetting class should not persist
    expect(el.classList.contains('resetting')).toBe(false);
  });
});
