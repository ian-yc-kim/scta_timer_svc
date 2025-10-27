import type { TimerState, TimerMode, TimerTickDetail, TimerStateChangeDetail, SessionTransitionDetail } from '../types/timer';

export const WORK_DURATION = 1500; // 25 minutes
export const BREAK_DURATION = 300; // 5 minutes

type EventHandler<T> = (detail: T) => void;

class TimerEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on<T>(name: string, handler: EventHandler<T>): void {
    const set = this.listeners.get(name) ?? new Set();
    set.add(handler);
    this.listeners.set(name, set);
  }

  off<T>(name: string, handler: EventHandler<T>): void {
    const set = this.listeners.get(name);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(name);
  }

  emit<T>(name: string, detail: T): void {
    const set = this.listeners.get(name);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        (handler as EventHandler<T>)(detail);
      } catch (error) {
        console.error('timerService:', error);
      }
    }
  }
}

const emitter = new TimerEventEmitter();

export const TIMER_TICK = 'timerTick';
export const TIMER_STATE_CHANGE = 'timerStateChange';
export const SESSION_TRANSITION = 'sessionTransition';

let timerState: TimerState = {
  mode: 'work',
  remainingTime: WORK_DURATION,
  isRunning: false,
  intervalId: null,
};

function emitTimerTick() {
  const payload: TimerTickDetail = { remainingTime: timerState.remainingTime };
  emitter.emit<TimerTickDetail>(TIMER_TICK, payload);
}

function emitTimerStateChange() {
  // shallow clone to avoid external mutation
  const payload: TimerStateChangeDetail = { timerState: { ...timerState } };
  emitter.emit<TimerStateChangeDetail>(TIMER_STATE_CHANGE, payload);
}

function emitSessionTransition() {
  const payload: SessionTransitionDetail = { newMode: timerState.mode };
  emitter.emit<SessionTransitionDetail>(SESSION_TRANSITION, payload);
}

export function initializeTimer(): void {
  try {
    timerState.mode = 'work';
    timerState.remainingTime = WORK_DURATION;
    timerState.isRunning = false;
    if (timerState.intervalId !== null) {
      try {
        clearInterval(timerState.intervalId as unknown as number);
      } catch (err) {
        // ignore
      }
      timerState.intervalId = null;
    }
    emitTimerStateChange();
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function startTimer(): void {
  try {
    // Clear any existing interval
    if (timerState.intervalId !== null) {
      try {
        clearInterval(timerState.intervalId as unknown as number);
      } catch (err) {
        // ignore
      }
      timerState.intervalId = null;
    }

    timerState.isRunning = true;

    const id = setInterval(() => {
      try {
        timerState.remainingTime -= 1;
        // Emit tick first
        emitTimerTick();

        if (timerState.remainingTime <= 0) {
          // ensure not negative
          timerState.remainingTime = 0;
          if (timerState.intervalId !== null) {
            try {
              clearInterval(timerState.intervalId as unknown as number);
            } catch (err) {
              // ignore
            }
            timerState.intervalId = null;
          }
          transitionSession();
        }
      } catch (error) {
        console.error('timerService:', error);
      }
    }, 1000);

    // store id (compatibly cast)
    timerState.intervalId = id as unknown as number;

    emitTimerStateChange();
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function pauseTimer(): void {
  try {
    if (!timerState.isRunning) return;

    timerState.isRunning = false;
    if (timerState.intervalId !== null) {
      try {
        clearInterval(timerState.intervalId as unknown as number);
      } catch (err) {
        // ignore
      }
      timerState.intervalId = null;
    }
    emitTimerStateChange();
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function resumeTimer(): void {
  try {
    if (!timerState.isRunning) {
      startTimer();
    }
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function resetTimer(): void {
  try {
    if (timerState.intervalId !== null) {
      try {
        clearInterval(timerState.intervalId as unknown as number);
      } catch (err) {
        // ignore
      }
      timerState.intervalId = null;
    }
    timerState.mode = 'work';
    timerState.remainingTime = WORK_DURATION;
    timerState.isRunning = false;
    emitTimerStateChange();
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function transitionSession(): void {
  try {
    if (timerState.mode === 'work') {
      timerState.mode = 'break';
      timerState.remainingTime = BREAK_DURATION;
    } else {
      timerState.mode = 'work';
      timerState.remainingTime = WORK_DURATION;
    }

    emitSessionTransition();

    // Automatically start next session
    startTimer();
  } catch (error) {
    console.error('timerService:', error);
  }
}

export function getTimerState(): TimerState {
  return { ...timerState };
}

// Event subscription helpers
export function on<T>(eventName: string, handler: EventHandler<T>): void {
  emitter.on<T>(eventName, handler as unknown as EventHandler<T>);
}

export function off<T>(eventName: string, handler: EventHandler<T>): void {
  emitter.off<T>(eventName, handler as unknown as EventHandler<T>);
}

// Test helpers (exposed for unit tests only)
export function __testSetRemainingTime(value: number): void {
  timerState.remainingTime = value;
}

export function __testSetMode(mode: TimerMode): void {
  timerState.mode = mode;
}
