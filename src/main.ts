import { initializeTimer, startTimer, pauseTimer, resetTimer } from './services/timerService';
import { initializeGearAnimations } from './components/GearAnimationController';

try {
  initializeTimer();
  initializeGearAnimations();

  // Bind UI buttons if present
  const startBtn = typeof document !== 'undefined' ? document.getElementById('start-btn') : null;
  if (startBtn) startBtn.addEventListener('click', () => { try { startTimer(); } catch (error) { console.error('Main:', error); } });

  const pauseBtn = typeof document !== 'undefined' ? document.getElementById('pause-btn') : null;
  if (pauseBtn) pauseBtn.addEventListener('click', () => { try { pauseTimer(); } catch (error) { console.error('Main:', error); } });

  const resetBtn = typeof document !== 'undefined' ? document.getElementById('reset-btn') : null;
  if (resetBtn) resetBtn.addEventListener('click', () => { try { resetTimer(); } catch (error) { console.error('Main:', error); } });
} catch (error) {
  console.error('Main:', error);
}
