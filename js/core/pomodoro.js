// 포모도로 타이머 계산. 집중 focus분 → 휴식 brk분 → 다시 집중 … 을 되풀이한다.
// 타이머는 시작 시각만 저장하므로 앱을 닫았다 열어도 지금이 몇 번째 집중인지 다시 계산된다.
// DOM을 쓰지 않는 순수 함수만 둔다.

// 고를 수 있는 길이 [집중분, 휴식분]. id는 저장값(state.study.mode)
export const TIMER_MODES = [
  { id: 'free', emoji: '⏱️', label: '자유 타이머' },
  { id: '25-5', emoji: '🍅', label: '포모도로 25·5', focus: 25, brk: 5 },
  { id: '50-10', emoji: '🍅', label: '길게 50·10', focus: 50, brk: 10 },
];

export const modeById = (id) => TIMER_MODES.find((m) => m.id === id) || TIMER_MODES[0];
export const isPomo = (timer) => !!(timer && timer.focus > 0);

// 지금 상태: 몇 번째 집중인지, 집중 중인지 쉬는 중인지, 남은 시간, 진행도, 지금까지 집중한 시간
export function pomoState(timer, now = Date.now()) {
  const f = timer.focus * 60000;
  const b = timer.brk * 60000;
  const elapsed = Math.max(0, now - timer.start);
  const n = Math.floor(elapsed / (f + b));
  const w = elapsed % (f + b);
  const focusing = w < f;
  return {
    round: n + 1,
    focusing,
    leftMs: focusing ? f - w : f + b - w,
    ratio: focusing ? w / f : (w - f) / b,
    focusMs: n * f + Math.min(w, f),
    key: `${n}-${focusing ? 'f' : 'b'}`,
  };
}

// 밀리초 → '24:59'
export function countdown(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
