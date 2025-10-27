import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as timer from '../js/script.js';

vi.useFakeTimers();

describe('JavaScript timer implementation', () => {
  beforeEach(() => {
    timer.initializeTimer();
  });

  afterEach(() => {
    timer.resetTimer();
  });

  it('initializeTimer sets defaults and emits state change', () => {
    const spy = vi.fn();
    timer.on(timer.JS_TIMER_STATE_CHANGE, spy);
    timer.initializeTimer();
    expect(spy).toHaveBeenCalled();
    const s = timer.getTimerState();
    expect(s.mode).toBe('work');
    expect(s.remainingTime).toBe(timer.WORK_DURATION);
    expect(s.isRunning).toBe(false);
    expect(s.intervalId).toBeNull();
    timer.off(timer.JS_TIMER_STATE_CHANGE, spy);
  });

  it('startTimer counts down and emits ticks', () => {
    const tickSpy = vi.fn();
    const stateSpy = vi.fn();
    timer.on(timer.JS_TIMER_TICK, tickSpy);
    timer.on(timer.JS_TIMER_STATE_CHANGE, stateSpy);

    timer.__testSetRemainingTime(5);
    timer.startTimer();

    expect(timer.getTimerState().isRunning).toBe(true);
    expect(stateSpy).toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    expect(tickSpy).toHaveBeenCalledTimes(3);
    expect(timer.getTimerState().remainingTime).toBe(2);

    timer.off(timer.JS_TIMER_TICK, tickSpy);
    timer.off(timer.JS_TIMER_STATE_CHANGE, stateSpy);
  });

  it('pauseTimer stops countdown and preserves remainingTime', () => {
    const stateSpy = vi.fn();
    timer.on(timer.JS_TIMER_STATE_CHANGE, stateSpy);

    timer.__testSetRemainingTime(5);
    timer.startTimer();
    vi.advanceTimersByTime(2000);
    timer.pauseTimer();

    const s = timer.getTimerState();
    expect(s.isRunning).toBe(false);
    expect(s.intervalId).toBeNull();
    expect(s.remainingTime).toBe(3);
    expect(stateSpy).toHaveBeenCalled();

    timer.off(timer.JS_TIMER_STATE_CHANGE, stateSpy);
  });

  it('resumeTimer restarts countdown from preserved remainingTime', () => {
    timer.__testSetRemainingTime(4);
    timer.startTimer();
    vi.advanceTimersByTime(2000);
    timer.pauseTimer();

    const saved = timer.getTimerState().remainingTime;
    timer.resumeTimer();
    expect(timer.getTimerState().isRunning).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(timer.getTimerState().remainingTime).toBe(saved - 1);
  });

  it('resetTimer reverts to work session paused and emits state change', () => {
    const stateSpy = vi.fn();
    timer.on(timer.JS_TIMER_STATE_CHANGE, stateSpy);

    timer.__testSetRemainingTime(10);
    timer.startTimer();
    timer.resetTimer();

    const s = timer.getTimerState();
    expect(s.mode).toBe('work');
    expect(s.remainingTime).toBe(timer.WORK_DURATION);
    expect(s.isRunning).toBe(false);
    expect(s.intervalId).toBeNull();
    expect(stateSpy).toHaveBeenCalled();

    timer.off(timer.JS_TIMER_STATE_CHANGE, stateSpy);
  });

  it('automatic transition from work to break when remainingTime hits zero', () => {
    const sessionSpy = vi.fn();
    timer.on(timer.JS_SESSION_TRANSITION, sessionSpy);

    timer.__testSetMode('work');
    timer.__testSetRemainingTime(1);
    timer.startTimer();

    vi.advanceTimersByTime(1000);

    expect(sessionSpy).toHaveBeenCalledWith({ newMode: 'break' });
    const s = timer.getTimerState();
    expect(s.mode).toBe('break');
    expect(s.remainingTime).toBe(timer.BREAK_DURATION);
    expect(s.isRunning).toBe(true);

    timer.off(timer.JS_SESSION_TRANSITION, sessionSpy);
  });

  it('automatic transition from break to work when remainingTime hits zero', () => {
    const sessionSpy = vi.fn();
    timer.on(timer.JS_SESSION_TRANSITION, sessionSpy);

    timer.__testSetMode('break');
    timer.__testSetRemainingTime(1);
    timer.startTimer();

    vi.advanceTimersByTime(1000);

    expect(sessionSpy).toHaveBeenCalledWith({ newMode: 'work' });
    const s = timer.getTimerState();
    expect(s.mode).toBe('work');
    expect(s.remainingTime).toBe(timer.WORK_DURATION);
    expect(s.isRunning).toBe(true);

    timer.off(timer.JS_SESSION_TRANSITION, sessionSpy);
  });
});
