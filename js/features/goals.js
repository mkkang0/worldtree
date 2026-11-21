// 더보기 > 퀘스트 · 업적. 보상 받기 동작은 홈의 퀘스트 카드에서도 쓴다.
import { rerender, ctx } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { ACHIEVEMENT_REWARD } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { claimQuest, claimWeek } from '../core/quests.js';
import { ACHIEVEMENTS } from '../core/achievements.js';
import { rewardHtml, amountText, backButton, title, bar } from '../ui/dom.js';
import { questsCard, weekCard } from '../ui/components.js';
import { toast, chime } from '../ui/effects.js';

export function view(state) {
  const day = todayKey();
  return `${backButton}
    <header class="page-head"><h1>퀘스트 · 업적</h1></header>
    ${questsCard(state, day)}
    ${weekCard(state, day)}
    <section class="card">
      ${title('업적', { iconName: 'trophy', aside: `달성마다 ${rewardHtml(ACHIEVEMENT_REWARD)}` })}
      <p class="tiny">모두 ${ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length} / ${ACHIEVEMENTS.length} · 종류를 눌러 펼쳐요</p>
      ${ACH_GROUPS.map((g) => achGroup(state, g)).join('')}
    </section>`;
}

// 업적 묶음 (목록에 없는 업적은 마지막 '그 밖의' 묶음으로)
const ACH_GROUPS = [
  { emoji: '🏃', label: '운동', ids: ['first', 'w10', 'w50', 'min1000', 'zone4', 'zone5'] },
  { emoji: '📚', label: '공부 · 가나', ids: ['study1', 'study10h', 'study50h', 'focus5', 'study100h', 'subjects2', 'goal7', 'kana1', 'kana-perfect', 'hira-master', 'kata-master', 'vocab1', 'vocab100', 'vocab-all'] },
  { emoji: '🔥', label: '꾸준함', ids: ['streak7', 'streak14', 'streak21', 'perfect', 'cups', 'cups7', 'week', 'week4', 'quest'] },
  { emoji: '🏝️', label: '섬 · 나라', ids: ['island1', 'island4', 'island8', 'level3', 'resident1', 'resident8', 'bestie', 'isle2', 'isle4', 'nation', 'festival'] },
  { emoji: '🌳', label: '세계수 · 꾸미기', ids: ['grad', 'dex4', 'dexall', 'items10', 'items30', 'items50', 'friend'] },
];

function achGroup(state, g) {
  const known = new Set(ACH_GROUPS.flatMap((x) => x.ids));
  const list = g === ACH_GROUPS[ACH_GROUPS.length - 1]
    ? [...g.ids.map((id) => ACHIEVEMENTS.find((a) => a.id === id)), ...ACHIEVEMENTS.filter((a) => !known.has(a.id))].filter(Boolean)
    : g.ids.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);
  const got = list.filter((a) => state.achievements[a.id]).length;
  return `<details class="ach-group">
    <summary><span class="em">${g.emoji}</span><b>${g.label}</b><span class="tiny">${got} / ${list.length}${got === list.length ? ' ✓' : ''}</span>${bar(got / list.length)}</summary>
    <div class="grid three">${list.map((a) => {
      const date = state.achievements[a.id];
      return `<div class="badge ${date ? 'on' : ''}" title="${a.desc}"><span class="em">${date ? a.emoji : '🔒'}</span><b>${a.name}</b><span class="tiny">${date ? date.slice(5).replace('-', '/') : a.desc}</span></div>`;
    }).join('')}</div>
  </details>`;
}

function receive(reward, label) {
  gain(reward);
  settle();
  chime('ok');
  toast(`${label} ${amountText(reward)}`);
  rerender();
}

export const actions = {
  'goals.claim': (el) => {
    const r = claimQuest(ctx.state, todayKey(), el.dataset.arg);
    if (r) receive(r, '퀘스트 완료!');
  },
  'goals.claimWeek': () => {
    const r = claimWeek(ctx.state, todayKey());
    if (r) receive(r, '주간 목표 달성!');
  },
};
