import { TIMER_STATE_CHANGE, TIMER_RESET, on, off } from '../services/timerService';
import type { TimerStateChangeDetail, TimerResetDetail } from '../types/timer';

function getGears(): HTMLElement[] {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll<HTMLElement>('.gear'));
}

function setRunning(isRunning: boolean): void {
  try {
    const gears = getGears();
    for (const g of gears) {
      if (isRunning) g.classList.add('running');
      else g.classList.remove('running');
    }
  } catch (error) {
    console.error('GearAnimationController:', error);
  }
}

function resetGears(): void {
  try {
    const gears = getGears();
    for (const el of gears) {
      el.classList.add('resetting');
      // force reflow to commit the style change
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void (el.offsetWidth);
      el.classList.remove('resetting');
    }
  } catch (error) {
    console.error('GearAnimationController:', error);
  }
}

export function initializeGearAnimations(): () => void {
  try {
    const stateHandler = (detail: TimerStateChangeDetail) => {
      try {
        setRunning(Boolean(detail?.timerState?.isRunning));
      } catch (error) {
        console.error('GearAnimationController:', error);
      }
    };

    const resetHandler = (_detail: TimerResetDetail) => {
      try {
        resetGears();
      } catch (error) {
        console.error('GearAnimationController:', error);
      }
    };

    on(TIMER_STATE_CHANGE, stateHandler);
    on(TIMER_RESET, resetHandler);

    // Initialize state based on current DOM and timer state events may follow
    return () => {
      off(TIMER_STATE_CHANGE, stateHandler);
      off(TIMER_RESET, resetHandler);
    };
  } catch (error) {
    console.error('GearAnimationController:', error);
    return () => {};
  }
}
