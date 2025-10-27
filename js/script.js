export const WORK_DURATION = 1500; // 25 minutes
export const BREAK_DURATION = 300; // 5 minutes

// Use JS-prefixed export names to avoid identifier collisions with other test modules
export const JS_TIMER_TICK = 'timerTick';
export const JS_TIMER_STATE_CHANGE = 'timerStateChange';
export const JS_SESSION_TRANSITION = 'sessionTransition';

class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  on(name, handler) {
    const set = this.listeners.get(name) || new Set();
    set.add(handler);
    this.listeners.set(name, set);
  }

  off(name, handler) {
    const set = this.listeners.get(name);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(name);
  }

  emit(name, payload) {
    const set = this.listeners.get(name);
    if (!set) return;
    for (const h of Array.from(set)) {
      try {
        h(payload);
      } catch (e) {
        console.error('timerService:', e);
      }
    }
  }
}

const emitter = new Emitter();

let timerState = {
  mode: 'work',
  remainingTime: WORK_DURATION,
  isRunning: false,
  intervalId: null
};

function emitTimerTick() {
  emitter.emit(JS_TIMER_TICK, { remainingTime: timerState.remainingTime });
}

function emitTimerStateChange() {
  emitter.emit(JS_TIMER_STATE_CHANGE, { timerState: { ...timerState } });
}

function emitSessionTransition() {
  emitter.emit(JS_SESSION_TRANSITION, { newMode: timerState.mode });
}

export function initializeTimer() {
  try {
    timerState.mode = 'work';
    timerState.remainingTime = WORK_DURATION;
    timerState.isRunning = false;
    if (timerState.intervalId !== null) {
      try { clearInterval(timerState.intervalId); } catch (e) { }
      timerState.intervalId = null;
    }
    emitTimerStateChange();
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function startTimer() {
  try {
    if (timerState.intervalId !== null) {
      try { clearInterval(timerState.intervalId); } catch (e) { }
      timerState.intervalId = null;
    }

    timerState.isRunning = true;

    const id = setInterval(() => {
      try {
        timerState.remainingTime -= 1;
        emitTimerTick();

        if (timerState.remainingTime <= 0) {
          timerState.remainingTime = 0;
          if (timerState.intervalId !== null) {
            try { clearInterval(timerState.intervalId); } catch (e) { }
            timerState.intervalId = null;
          }
          transitionSession();
        }
      } catch (err) {
        console.error('timerService:', err);
      }
    }, 1000);

    timerState.intervalId = id;
    emitTimerStateChange();
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function pauseTimer() {
  try {
    if (!timerState.isRunning) return;
    timerState.isRunning = false;
    if (timerState.intervalId !== null) {
      try { clearInterval(timerState.intervalId); } catch (e) { }
      timerState.intervalId = null;
    }
    emitTimerStateChange();
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function resumeTimer() {
  try {
    if (!timerState.isRunning) {
      startTimer();
    }
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function resetTimer() {
  try {
    if (timerState.intervalId !== null) {
      try { clearInterval(timerState.intervalId); } catch (e) { }
      timerState.intervalId = null;
    }
    timerState.mode = 'work';
    timerState.remainingTime = WORK_DURATION;
    timerState.isRunning = false;
    emitTimerStateChange();
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function transitionSession() {
  try {
    if (timerState.mode === 'work') {
      timerState.mode = 'break';
      timerState.remainingTime = BREAK_DURATION;
    } else {
      timerState.mode = 'work';
      timerState.remainingTime = WORK_DURATION;
    }
    emitSessionTransition();
    startTimer();
  } catch (e) {
    console.error('timerService:', e);
  }
}

export function getTimerState() {
  return { ...timerState };
}

export function on(eventName, handler) { emitter.on(eventName, handler); }
export function off(eventName, handler) { emitter.off(eventName, handler); }

// test helpers
export function __testSetRemainingTime(value) { timerState.remainingTime = value; }
export function __testSetMode(mode) { timerState.mode = mode; }
