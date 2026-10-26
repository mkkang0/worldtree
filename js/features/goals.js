// 더보기 > 퀘스트 · 업적. 보상 받기 동작은 홈의 퀘스트 카드에서도 쓴다.
import { rerender, ctx } from '../app/context.js';
import { gain, settle } from '../app/wallet.js';
import { ACHIEVEMENT_REWARD } from '../core/config.js';
import { todayKey } from '../core/dates.js';
import { claimQuest, claimWeek } from '../core/quests.js';
import { ACHIEVEMENTS } from '../core/achievements.js';
import { rewardHtml, amountText, backButton, title } from '../ui/dom.js';
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
      <div class="grid three">${ACHIEVEMENTS.map((a) => {
        const date = state.achievements[a.id];
        return `<div class="badge ${date ? 'on' : ''}" title="${a.desc}"><span class="em">${date ? a.emoji : '🔒'}</span><b>${a.name}</b><span class="tiny">${date ? date.slice(5).replace('-', '/') : a.desc}</span></div>`;
      }).join('')}</div>
    </section>`;
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
