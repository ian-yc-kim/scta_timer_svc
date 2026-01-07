import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as timerService from './timerService';
import { TIMER_TICK, TIMER_STATE_CHANGE, SESSION_TRANSITION, WORK_DURATION, BREAK_DURATION, TIMER_RESET } from './timerService';

vi.useFakeTimers();

describe('timerService core behaviors', () => {
  beforeEach(() => {
    timerService.initializeTimer();
  });

  afterEach(() => {
    // ensure timers cleared
    timerService.resetTimer();
  });

  it('initializeTimer sets default work session and emits timerStateChange', () => {
    const spy = vi.fn();
    timerService.on(TIMER_STATE_CHANGE, spy);

    timerService.initializeTimer();

    expect(spy).toHaveBeenCalled();
    const state = timerService.getTimerState();
    expect(state.mode).toBe('work');
    expect(state.remainingTime).toBe(WORK_DURATION);
    expect(state.isRunning).toBe(false);
    expect(state.intervalId).toBeNull();

    timerService.off(TIMER_STATE_CHANGE, spy);
  });

  it('startTimer starts countdown, emits timerTick and timerStateChange, and decrements remainingTime', () => {
    const tickSpy = vi.fn();
    const stateSpy = vi.fn();
    timerService.on(TIMER_TICK, tickSpy);
    timerService.on(TIMER_STATE_CHANGE, stateSpy);

    // set small remaining time for test speed
    timerService.__testSetRemainingTime(5);
    timerService.startTimer();

    const started = timerService.getTimerState();
    expect(started.isRunning).toBe(true);
    expect(stateSpy).toHaveBeenCalled(); // start emitted state change

    vi.advanceTimersByTime(3000);

    expect(tickSpy).toHaveBeenCalledTimes(3);

    const after = timerService.getTimerState();
    expect(after.remainingTime).toBe(2);

    timerService.off(TIMER_TICK, tickSpy);
    timerService.off(TIMER_STATE_CHANGE, stateSpy);
  });

  it('pauseTimer stops countdown and preserves remainingTime', () => {
    const stateSpy = vi.fn();
    timerService.on(TIMER_STATE_CHANGE, stateSpy);

    timerService.__testSetRemainingTime(5);
    timerService.startTimer();

    vi.advanceTimersByTime(2000);
    timerService.pauseTimer();

    const state = timerService.getTimerState();
    expect(state.isRunning).toBe(false);
    expect(state.intervalId).toBeNull();
    expect(state.remainingTime).toBe(3);
    expect(stateSpy).toBeCalled();

    timerService.off(TIMER_STATE_CHANGE, stateSpy);
  });

  it('resumeTimer restarts countdown from preserved remainingTime', () => {
    timerService.__testSetRemainingTime(4);
    timerService.startTimer();

    vi.advanceTimersByTime(2000);
    timerService.pauseTimer();

    const saved = timerService.getTimerState().remainingTime;
    timerService.resumeTimer();
    expect(timerService.getTimerState().isRunning).toBe(true);

    vi.advanceTimersByTime(1000);
    const after = timerService.getTimerState();
    expect(after.remainingTime).toBe(saved - 1);
  });

  it('resetTimer reverts to 25-minute paused work session and emits timerStateChange', () => {
    const stateSpy = vi.fn();
    timerService.on(TIMER_STATE_CHANGE, stateSpy);

    timerService.__testSetRemainingTime(10);
    timerService.startTimer();
    timerService.resetTimer();

    const state = timerService.getTimerState();
    expect(state.mode).toBe('work');
    expect(state.remainingTime).toBe(WORK_DURATION);
    expect(state.isRunning).toBe(false);
    expect(state.intervalId).toBeNull();
    expect(stateSpy).toHaveBeenCalled();

    timerService.off(TIMER_STATE_CHANGE, stateSpy);
  });

  it('resetTimer also emits TIMER_RESET event', () => {
    const resetSpy = vi.fn();
    timerService.on(TIMER_RESET, resetSpy);

    timerService.__testSetRemainingTime(8);
    timerService.resetTimer();

    expect(resetSpy).toHaveBeenCalled();

    timerService.off(TIMER_RESET, resetSpy);
  });

  it('automatic transition from work to break when remainingTime hits zero', () => {
    const sessionSpy = vi.fn();
    const stateSpy = vi.fn();
    timerService.on(SESSION_TRANSITION, sessionSpy);
    timerService.on(TIMER_STATE_CHANGE, stateSpy);

    timerService.__testSetMode('work');
    timerService.__testSetRemainingTime(1);
    timerService.startTimer();

    vi.advanceTimersByTime(1000);

    // transition should have been emitted
    expect(sessionSpy).toHaveBeenCalledWith({ newMode: 'break' });

    const state = timerService.getTimerState();
    expect(state.mode).toBe('break');
    expect(state.remainingTime).toBe(BREAK_DURATION);
    expect(state.isRunning).toBe(true); // auto-started

    timerService.off(SESSION_TRANSITION, sessionSpy);
    timerService.off(TIMER_STATE_CHANGE, stateSpy);
  });

  it('automatic transition from break to work when remainingTime hits zero', () => {
    const sessionSpy = vi.fn();
    timerService.on(SESSION_TRANSITION, sessionSpy);

    timerService.__testSetMode('break');
    timerService.__testSetRemainingTime(1);
    timerService.startTimer();

    vi.advanceTimersByTime(1000);

    expect(sessionSpy).toHaveBeenCalledWith({ newMode: 'work' });

    const state = timerService.getTimerState();
    expect(state.mode).toBe('work');
    expect(state.remainingTime).toBe(WORK_DURATION);
    expect(state.isRunning).toBe(true);

    timerService.off(SESSION_TRANSITION, sessionSpy);
  });
});
