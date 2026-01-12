# Steampunk Concept Timer — Gear Animation Framework

This repository contains the Steampunk Concept Timer frontend. The project includes a small CSS animation framework used to render rotating gears with pause / run / reset behavior and a light-weight timer service that drives the visual state.

Quick start

- Install dependencies: npm install
- Run tests: npm test (vitest)
- Build: npm run build

Note: The project uses Vite and the test harness runs with Vitest (jsdom environment).

---

Design System

This Design System section documents the core visual tokens, typography, key CSS classes, and the CSS file structure used across the project. Place this near the top for discoverability and to help contributors quickly adopt consistent styles.

1) Color Palette (design tokens)

The palette is defined as CSS custom properties in src/styles/theme.css.

| Token | Hex / Value | Usage |
|---|---:|---|
| --color-brown | #8B4513 | Primary brown tone for accents and borders |
| --color-brown-dark | #60320d | Darker brown for deep borders/shadows |
| --color-brown-light | #b07a46 | Lighter brown for muted labels and small text |
| --color-gold | #FFD700 | Primary highlight color for headings and accents |
| --color-gold-muted | #d4b300 | Muted gold for body text and buttons |
| --color-gold-dark | #b38f00 | Dark gold for gradients and depth |
| --color-copper | #B87333 | Copper midtone for surfaces and gradients |
| --color-copper-dark | #874b20 | Copper dark for bezels and borders |
| --color-copper-light | #d29a6b | Copper light for inner gradients |
| --shadow-deep | 0 8px 24px rgba(0,0,0,0.6) | Deep elevation shadow |
| --shadow-soft | 0 4px 12px rgba(0,0,0,0.45) | Soft elevation shadow |
| --highlight-warm | rgba(255, 230, 150, 0.12) | Subtle warm overlay highlight |

Usage example (CSS):

```css
.button {
  color: var(--color-brown-dark);
  background: linear-gradient(180deg, var(--color-gold-muted), var(--color-copper));
  box-shadow: var(--shadow-soft);
}
```

2) Typography

Typography tokens are defined in src/styles/theme.css:

- --font-body: 'Courier Prime', Georgia, 'Times New Roman', serif;
- --font-heading: Georgia, 'Courier Prime', serif;

Where applied:
- body uses --font-body (site body copy, labels)
- h1..h5 use --font-heading (headings with gold color)
- .label and .label--demo use the body font for small, readable labels

3) Key CSS Classes & Usage

These classes live primarily in src/styles/components.css and src/styles/gearAnimations.css. Use the listed class when indicated to ensure consistent visuals.

- .steampunk-btn — Primary button styling. Use for interactive controls (Start, Pause, Reset). Includes hover, active, and focus-visible states.
- .clock-face — Main circular bezel container. Use as root for analog/visual clock elements.
- .panel — Warm, bordered surface utility; use as a generic card/panel wrapper.
- .label — Muted label text for small annotations.
- .label--demo — Localized demo label to avoid global .label override; use in demo markup.
- .control-bar — Container for timer control buttons and small control groups.
- .demo-row — Layout row for demo gear elements; responsive behavior included.

Gear animation framework (src/styles/gearAnimations.css):
- .gear — Base gear element. Declares rotation animation and GPU hints. Requires custom properties to control speed/direction/initial rotation.
  - Custom properties used:
    - --gear-rotation-speed (defaults to 10s)
    - --gear-rotation-direction (normal | reverse)
    - --gear-initial-rotation (angle used when snapping during reset)
- .gear.running — Toggles animation-play-state: running to start continuous rotation.
- .gear.resetting — Applies animation: none and transform to snap to --gear-initial-rotation; intended for brief application during reset sequence.
- .gear-demo — Visual demo disc used in examples; provides size and decorative styling for demo gears.

Recommended markup example:

```html
<div class="control-bar">
  <button class="steampunk-btn">Start</button>
  <button class="steampunk-btn">Pause</button>
  <button class="steampunk-btn">Reset</button>
</div>

<div class="clock-face">
  <section class="demo-row">
    <div>
      <div class="gear gear-demo" style="--gear-rotation-speed:8s; --gear-initial-rotation:0deg;"></div>
      <div class="label--demo">Paused</div>
    </div>
  </section>
</div>
```

4) CSS File Structure and Intent

Follow the ordering and intent below to keep tokens available and styles predictable:

- src/styles/theme.css
  - Purpose: global tokens (colors, shadows, fonts), element defaults, small utilities (e.g., .panel, .label).
  - Should be loaded first so tokens are available to downstream files.

- src/styles/components.css
  - Purpose: component and layout-level styles (buttons, control-bar, clock-face, demo helpers, responsive rules).
  - Contains the primary CSS classes used by components and markup.

- src/styles/gearAnimations.css
  - Purpose: isolated animation framework for gears: keyframes, .gear base rules, modifying classes (.running, .resetting).
  - Keep animation-specific rules here so they remain reusable and independent from component visuals.

Recommended load order in HTML / app shell:
1. theme.css
2. components.css
3. gearAnimations.css

5) Notes on Integration and Behavior

- Gears start paused by default (animation-play-state: paused). Use .running to enable rotation.
- Reset behavior uses .gear.resetting plus a forced reflow (void el.offsetWidth) in the controller to snap to --gear-initial-rotation.
- All animation tuning should prefer per-element custom properties over changing global CSS when possible.

6) Verification / Testing (Manual)

- Open README.md in a markdown viewer and confirm tables, headings, and code fences render correctly.
- Cross-check documented variables and classes with these files:
  - src/styles/theme.css
  - src/styles/components.css
  - src/styles/gearAnimations.css
- Confirm token names and hex values match the source files.

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
