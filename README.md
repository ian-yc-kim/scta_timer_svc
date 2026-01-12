# Steampunk Concept Timer — Gear Animation Framework

This repository contains the Steampunk Concept Timer frontend. The project includes a small CSS animation framework used to render rotating gears with pause / run / reset behavior and a light-weight timer service that drives the visual state.

Quick start

- Install dependencies: npm install
- Run tests: npm test (vitest)
- Build: npm run build

Note: The project uses Vite and the test harness runs with Vitest (jsdom environment).

---

CSS Animation Framework

Overview

The gear animation framework is implemented in src/styles/gearAnimations.css. It provides a GPU-accelerated continuous rotation animation intended to be paused by default, explicitly started when needed, and snapped to an initial rotation when reset.

Key files

- src/styles/gearAnimations.css — keyframes, base .gear rules, and modifier classes
- src/components/GearAnimationController.ts — subscribes to timerService events and toggles classes
- index.html — demo usage of .gear elements

Core classes and behavior

- .gear
  - Declares the rotate animation using the keyframes named rotate.
  - Uses animation-play-state: paused by default (so gears are idle unless explicitly started).
  - Adds GPU hints (will-change: transform and transform: translateZ(0)) to encourage compositor acceleration.
  - Default CSS custom properties:
    - --gear-rotation-speed: 10s (used as animation-duration)
    - --gear-rotation-direction: normal (used as animation-direction)
    - --gear-initial-rotation: 0deg (used when snapping during reset)

- .gear.running
  - Sets animation-play-state: running so the declared rotate animation will run continuously.

- .gear.resetting
  - Stops any running animation by applying animation: none !important and sets transform: rotate(var(--gear-initial-rotation, 0deg)).
  - Intended to be applied briefly to snap the element to a known rotation state.

Keyframes

- @keyframes rotate
  - from { transform: rotate(0deg); }
  - to { transform: rotate(360deg); }

CSS custom properties (usage and defaults)

- --gear-rotation-speed
  - Controls the duration of one full rotation (animation-duration).
  - Default: 10s. Example values: 4s, 8s, 12s.

- --gear-rotation-direction
  - Controls direction of rotation (animation-direction). Accepts normal or reverse.
  - Default: normal.

- --gear-initial-rotation
  - Angle used when snapping the gear during reset (applied via transform in .gear.resetting).
  - Default: 0deg.

Reset mechanics and why forced reflow is used

Reset involves a short sequence managed by the GearAnimationController:

1. The controller adds the .gear.resetting class to the element.
2. It forces a reflow (in code via void el.offsetWidth) to ensure the browser applies the style change immediately.
3. It then removes the .gear.resetting class.

Why this is necessary

- animation: none !important together with transform causes the element to snap to the specified rotation immediately.
- By forcing a reflow while the resetting style is applied we make sure the browser commits that snapped state. Removing the class afterward allows normal animations to proceed from the snapped base state.

Performance notes

- Use transform-based animations (rotate) to keep the work on the compositor thread.
- will-change: transform and transform: translateZ(0) are used as hints to the browser to prepare for smooth compositing.
- Avoid animating layout properties (width, height, top, left) for continuous rotation.
- The framework keeps animations paused by default so we only run the GPU work while the timer indicates active state.

Usage examples

Minimal HTML

```html
<div class="gear"
     style="--gear-rotation-speed: 8s; --gear-rotation-direction: normal; --gear-initial-rotation: 0deg;">
</div>
```

Start running via class toggle (conceptual)

```javascript
const el = document.querySelector('.gear');
el.classList.add('running'); // gear rotation starts
```

Pause

```javascript
el.classList.remove('running'); // rotation stops but preserves transform state
```

Reset (conceptual)

```javascript
el.classList.add('resetting');
void el.offsetWidth; // force reflow so the snapped transform is applied
el.classList.remove('resetting');
```

Note: In this project the class toggling is handled by GearAnimationController and timerService (see below).

---

timerService integration and architecture

The visual state is driven by a small in-memory timer service implemented at src/services/timerService.ts and a controller in src/components/GearAnimationController.ts.

timerService (what it is)

- A compact state machine that maintains the current session mode, remainingTime, isRunning flag, and an intervalId for the active timer.
- Exposes imperative APIs used by the app:
  - initializeTimer()
  - startTimer()
  - pauseTimer()
  - resumeTimer()
  - resetTimer()
  - getTimerState()
- Uses an internal event emitter API with subscription helpers on(eventName, handler) and off(eventName, handler).

Events emitted by timerService

- TIMER_TICK ('timerTick')
  - Emitted every second with a payload { remainingTime } while the timer is running.
- TIMER_STATE_CHANGE ('timerStateChange')
  - Emitted whenever the timer state is updated (start/pause/reset/initialize). Payload: { timerState }.
  - This event drives the .running toggles for gear visuals.
- TIMER_RESET ('timerReset')
  - Emitted specifically on reset so UI components can do a distinct reset animation (snap) separate from generic state changes.
- SESSION_TRANSITION ('sessionTransition')
  - Emitted when the timer automatically transitions between work and break sessions.

GearAnimationController responsibilities

- Located at src/components/GearAnimationController.ts.
- Subscribes to TIMER_STATE_CHANGE to toggle the .running class based on timerState.isRunning.
- Subscribes to TIMER_RESET to perform the reset sequence that briefly applies .gear.resetting and forces a reflow (void el.offsetWidth) so the gear snaps to --gear-initial-rotation.
- Exports initializeGearAnimations() which sets up subscriptions and returns a cleanup function which calls off(...) for each handler.
- Uses try/catch and logs errors with console.error('GearAnimationController:', error) per project conventions.

Initialization and DOM contract

- The application entrypoint src/main.ts calls initializeTimer() and initializeGearAnimations().
- GearAnimationController expects gear elements to use the CSS class .gear so it can select and manipulate them. Ensure your DOM contains elements with class="gear".

Integration example (existing in src/main.ts)

- initializeTimer() is called at app startup.
- initializeGearAnimations() is called to connect visuals to timer events.
- Demo UI buttons in index.html call startTimer(), pauseTimer(), and resetTimer().

Design notes and constraints

- The animation framework is purely client-side CSS/DOM logic and does not require server configuration.
- Keep animations focused and small. All animation parameters are exposed via CSS custom properties so components can tune behavior without changing the CSS file.

Troubleshooting

- If gears do not rotate when the timer starts, verify that:
  - Elements have the .gear class.
  - initializeGearAnimations() was called (src/main.ts).
  - Timer emits TIMER_STATE_CHANGE with timerState.isRunning === true.
- If reset snapping appears delayed or not applied, ensure the controller forces reflow (the implementation uses void el.offsetWidth) and that --gear-initial-rotation is set to the intended value.

---

Files of interest

- src/styles/gearAnimations.css
- src/components/GearAnimationController.ts
- src/services/timerService.ts
- index.html (demo usage)

If you modify the animation parameters, prefer changing CSS custom properties on individual gear elements instead of changing the global CSS to keep per-gear variations simple and safe.
