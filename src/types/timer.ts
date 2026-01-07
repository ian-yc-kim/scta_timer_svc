export type TimerMode = 'work' | 'break';

export interface TimerState {
  mode: TimerMode;
  remainingTime: number;
  isRunning: boolean;
  intervalId: number | null;
}

export interface TimerTickDetail {
  remainingTime: number;
}

export interface TimerStateChangeDetail {
  timerState: TimerState;
}

export interface TimerResetDetail {
  // include snapshot of timer state at reset
  timerState: TimerState;
}

export interface SessionTransitionDetail {
  newMode: TimerMode;
}
