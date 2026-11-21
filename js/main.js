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
render(); // 시작할 때 달성한 업적·이사 온 주민까지 반영해 다시 그린다

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

// 오프라인 캐시(sw.js). 새 버전이 올라오면 앱을 다시 열 때마다 확인하고, 준비되면 '새로고침' 띠를 띄운다.
// (예전에는 앱을 두 번 열어야 새 버전이 보였다)
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker
    .register('sw.js')
    .then((reg) => {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    })
    .catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) showUpdateBanner();
  });
}

function showUpdateBanner() {
  if (document.getElementById('update-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'update-bar';
  bar.setAttribute('role', 'status');
  bar.innerHTML = '<span>✨ 새 버전이 준비됐어요</span><button type="button">새로고침</button>';
  bar.querySelector('button').addEventListener('click', () => location.reload());
  document.body.appendChild(bar);
}
