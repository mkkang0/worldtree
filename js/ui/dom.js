// 작은 HTML 조각 도우미. 사용자가 입력한 글자는 반드시 esc()로 감싼다.
import { icon } from './icons.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// 포인트 종류. 이름을 바꾸려면 label만 고치면 된다.
export const CURRENCIES = [
  { id: 'sun', label: '햇살', icon: 'sun', from: '운동' },
  { id: 'water', label: '이슬', icon: 'drop', from: '식단' },
  { id: 'star', label: '별빛', icon: 'sparkle', from: '공부' },
];

// 아이콘이 붙은 포인트 표시: money('sun', 12) → ☀ 12
export const money = (id, value, plus = false) => {
  const c = CURRENCIES.find((x) => x.id === id);
  return `<span class="cur cur-${id}">${icon(c.icon)}${plus ? '+' : ''}${value}</span>`;
};

// { sun: 10, water: 5 } → 아이콘 붙은 HTML
export const amountHtml = (r = {}, plus = false) =>
  CURRENCIES.filter((c) => r[c.id]).map((c) => money(c.id, r[c.id], plus)).join(' ');
export const costHtml = (cost) => amountHtml(cost) || '무료';
export const rewardHtml = (r) => amountHtml(r, true);

// 토스트처럼 글자만 쓸 수 있는 곳: '햇살 +10 · 이슬 +5'
export const amountText = (r = {}) =>
  CURRENCIES.filter((c) => r[c.id]).map((c) => `${c.label} +${r[c.id]}`).join(' · ');

export function bar(ratio, cls = '') {
  return `<div class="bar ${cls}"><i style="width:${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%"></i></div>`;
}

// 라디오 버튼을 칩 모양으로. options: [{ value, label }]
export function radioChips(name, options, checked) {
  return `<div class="chips">${options
    .map(
      (o) =>
        `<label class="chip"><input type="radio" name="${name}" value="${o.value}" ${String(o.value) === String(checked) ? 'checked' : ''}><span>${o.label}</span></label>`
    )
    .join('')}</div>`;
}

export function stat(value, label, iconName = '') {
  return `<div class="card stat">${iconName ? icon(iconName, 'stat-ic') : ''}<span class="big">${value}</span><span class="tiny">${label}</span></div>`;
}

// 카드 제목: 아이콘 + 제목 + (오른쪽 보조 글)
export function title(text, { iconName = '', aside = '' } = {}) {
  return `<h2 class="title">${iconName ? icon(iconName) : ''}<span>${text}</span>${aside ? `<small>${aside}</small>` : ''}</h2>`;
}

export const backButton = `<button class="back" data-act="nav.sub" data-arg="">${icon('left')}더보기</button>`;
