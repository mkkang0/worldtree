// 이벤트 연결. HTML에 이름표만 달면 해당 동작이 실행된다.
//   data-act="기능.동작"   → 클릭 (data-arg 로 값 전달)
//   data-form="기능.동작"  → 폼 제출
//   data-input="기능.동작" → 입력할 때마다
// 동작 함수는 (요소, 이벤트)를 받는다.
import { ALL_ACTIONS } from './render.js';

function run(name, el, e) {
  const fn = ALL_ACTIONS[name];
  if (fn) fn(el, e);
  else console.warn('등록되지 않은 동작:', name);
}

export function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && !el.disabled) run(el.dataset.act, el, e);
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    run(form.dataset.form, form, e);
  });

  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el) run(el.dataset.input, el, e);
  });

  // 버튼이 아닌 요소(캐릭터 등)도 키보드로 누를 수 있게
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act]:not(button)')) {
      e.preventDefault();
      e.target.click();
    }
  });
}
