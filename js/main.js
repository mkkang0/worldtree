// 앱 시작점
import { ctx, setRenderer } from './app/context.js';
import { render } from './app/render.js';
import { bindEvents } from './app/events.js';
import { settle } from './app/wallet.js';
import { importFromHash } from './features/workout.js';
import { tickTimers } from './features/study.js';
import { useSound } from './ui/effects.js';
import { todayKey } from './core/dates.js';

useSound(() => ctx.state.settings.sound);
setRenderer(render);
bindEvents();

if (!ctx.state.onboarded) ctx.ui.modal = 'onboarding';
render();
if (!ctx.ui.modal) importFromHash();
settle();

// 공부 타이머 시계
setInterval(tickTimers, 1000);

// 자정을 넘겨 다시 열면 '오늘' 화면을 새로 그린다. (입력 중인 폼을 지우지 않도록 날짜가 바뀔 때만)
let shownDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && todayKey() !== shownDay) {
    shownDay = todayKey();
    render();
  }
});

navigator.storage?.persist?.().catch(() => {});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
